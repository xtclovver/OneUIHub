package handlers

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/repository"
	"oneui-hub/internal/service"
	"oneui-hub/pkg/auth"
)

type UserHandler struct {
	userService   *service.UserService
	litellmClient *litellm.Client
	apiKeyRepo    repository.ApiKeyRepository
	requestRepo   repository.RequestRepository
}

func NewUserHandler(userService *service.UserService, litellmClient *litellm.Client, apiKeyRepo repository.ApiKeyRepository, requestRepo repository.RequestRepository) *UserHandler {
	return &UserHandler{
		userService:   userService,
		litellmClient: litellmClient,
		apiKeyRepo:    apiKeyRepo,
		requestRepo:   requestRepo,
	}
}

// GetUserSpending получает данные о тратах пользователя из LiteLLM
func (h *UserHandler) GetUserSpending(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Получаем данные о тратах из LiteLLM
	usage, err := h.litellmClient.GetUsage(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get usage data"})
		return
	}

	response := map[string]interface{}{
		"user_id":             userID,
		"current_month_usage": usage.TotalCost,
		"total_usage":         usage.TotalCost,
		"currency":            "USD",
		"total_tokens":        usage.TotalTokens,
		"primary_model":       usage.Model,
	}

	c.JSON(http.StatusOK, response)
}

// GetUserApiKeys получает API ключи пользователя из локальной БД
func (h *UserHandler) GetUserApiKeys(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Получаем ключи пользователя из локальной БД
	apiKeys, err := h.apiKeyRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get API keys"})
		return
	}

	// Конвертируем в формат ответа
	response := make([]map[string]interface{}, 0, len(apiKeys))
	for _, key := range apiKeys {
		keyData := map[string]interface{}{
			"id":              key.ID,
			"name":            key.Name,
			"api_key_preview": key.ApiKeyPreview,
			"external_id":     key.ExternalID,
			"created_at":      key.CreatedAt.Format(time.RFC3339),
			"is_active":       true,
			"usage_count":     0,
			"total_cost":      0.0,
			"last_used":       "",
		}

		if key.ExpiresAt != nil {
			keyData["expires_at"] = key.ExpiresAt.Format(time.RFC3339)
		}

		// Получаем статистику использования из LiteLLM
		if key.OriginalKey != "" {
			// Расшифровываем ключ для запроса статистики
			originalKey, err := auth.DecryptAPIKey(key.OriginalKey)
			if err != nil {
				fmt.Printf("Warning: failed to decrypt API key %s: %v\n", key.Name, err)
			} else {
				stats, err := h.litellmClient.GetKeyUsageStats(c.Request.Context(), originalKey)
				if err != nil {
					// Логируем ошибку, но продолжаем работу
					fmt.Printf("Warning: failed to get usage stats for API key %s: %v\n", key.Name, err)
				} else {
					if usageCount, ok := stats["usage_count"].(int); ok {
						keyData["usage_count"] = usageCount
					}
					if totalCost, ok := stats["total_cost"].(float64); ok {
						keyData["total_cost"] = totalCost
					}
					if lastUsed, ok := stats["last_used"].(string); ok && lastUsed != "" {
						keyData["last_used"] = lastUsed
					}
					if modelsUsed, ok := stats["models_used"].(map[string]int); ok {
						keyData["models_used"] = modelsUsed
					}
					if providersUsed, ok := stats["providers_used"].(map[string]int); ok {
						keyData["providers_used"] = providersUsed
					}
				}
			}
		}

		response = append(response, keyData)
	}

	c.JSON(http.StatusOK, response)
}

// CreateUserApiKey создает новый API ключ для пользователя
func (h *UserHandler) CreateUserApiKey(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Создаем ключ в LiteLLM
	keyReq := &litellm.LiteLLMKeyRequest{
		KeyAlias: req.Name,
		UserID:   userID,
	}

	keyResponse, err := h.litellmClient.CreateKey(c.Request.Context(), keyReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create API key in LiteLLM"})
		return
	}

	// Шифруем оригинальный ключ для хранения
	encryptedKey, err := auth.EncryptAPIKey(keyResponse.Key)
	if err != nil {
		// Если не удалось зашифровать, удаляем ключ из LiteLLM
		_ = h.litellmClient.DeleteKey(c.Request.Context(), keyResponse.KeyName)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt API key"})
		return
	}

	// Создаем превью ключа
	keyPreview := auth.CreateAPIKeyPreview(keyResponse.Key)

	// Создаем хеш ключа
	keyHash := fmt.Sprintf("%x", sha256.Sum256([]byte(keyResponse.Key)))

	apiKey := &domain.ApiKey{
		ID:            uuid.New().String(),
		UserID:        userID,
		KeyHash:       keyHash,
		OriginalKey:   encryptedKey,
		ApiKeyPreview: keyPreview,
		ExternalID:    keyResponse.KeyName,
		Name:          req.Name,
		CreatedAt:     time.Now(),
	}

	if err := h.apiKeyRepo.Create(c.Request.Context(), apiKey); err != nil {
		// Если не удалось сохранить в БД, удаляем ключ из LiteLLM
		_ = h.litellmClient.DeleteKey(c.Request.Context(), keyResponse.KeyName)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save API key"})
		return
	}

	response := map[string]interface{}{
		"id":              apiKey.ID,
		"name":            apiKey.Name,
		"api_key":         keyResponse.Key, // Возвращаем ключ только при создании
		"api_key_preview": keyPreview,
		"external_id":     apiKey.ExternalID,
		"created_at":      apiKey.CreatedAt.Format(time.RFC3339),
		"is_active":       true,
		"usage_count":     0,
	}

	c.JSON(http.StatusCreated, response)
}

// DeleteUserApiKey удаляет API ключ пользователя
func (h *UserHandler) DeleteUserApiKey(c *gin.Context) {
	keyID := c.Param("key_id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Key ID is required"})
		return
	}

	fmt.Printf("DEBUG: DeleteUserApiKey called for key ID: %s\n", keyID)

	// Получаем информацию о ключе из локальной БД
	apiKey, err := h.apiKeyRepo.GetByID(c.Request.Context(), keyID)
	if err != nil {
		fmt.Printf("ERROR: API key not found in DB: %s, error: %v\n", keyID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "API key not found"})
		return
	}

	fmt.Printf("DEBUG: Found API key: name=%s, external_id=%s, has_original_key=%t\n",
		apiKey.Name, apiKey.ExternalID, apiKey.OriginalKey != "")

	// Удаляем ключ из LiteLLM
	var keyToDelete string

	// Сначала пробуем использовать расшифрованный оригинальный ключ
	if apiKey.OriginalKey != "" {
		originalKey, err := auth.DecryptAPIKey(apiKey.OriginalKey)
		if err != nil {
			fmt.Printf("WARNING: Failed to decrypt API key %s: %v, trying ExternalID\n", apiKey.Name, err)
			// Если не удалось расшифровать, пробуем ExternalID
			if apiKey.ExternalID != "" {
				keyToDelete = apiKey.ExternalID
			}
		} else {
			keyToDelete = originalKey
			fmt.Printf("DEBUG: Using decrypted original key for deletion\n")
		}
	} else if apiKey.ExternalID != "" {
		// Если нет оригинального ключа, используем ExternalID
		keyToDelete = apiKey.ExternalID
		fmt.Printf("DEBUG: Using ExternalID for deletion (no original key)\n")
	}

	if keyToDelete != "" {
		fmt.Printf("DEBUG: Attempting to delete key from LiteLLM: %s...\n", keyToDelete[:min(10, len(keyToDelete))])
		if err := h.litellmClient.DeleteKey(c.Request.Context(), keyToDelete); err != nil {
			fmt.Printf("ERROR: Failed to delete API key from LiteLLM: %v\n", err)
			// Не возвращаем ошибку, продолжаем удаление из локальной БД
			fmt.Printf("WARNING: Continuing with local DB deletion despite LiteLLM error\n")
		} else {
			fmt.Printf("DEBUG: Successfully deleted key from LiteLLM\n")
		}
	} else {
		fmt.Printf("WARNING: No key available for LiteLLM deletion, only deleting from local DB\n")
	}

	// Удаляем ключ из локальной БД
	if err := h.apiKeyRepo.Delete(c.Request.Context(), keyID); err != nil {
		fmt.Printf("ERROR: Failed to delete API key from local DB: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete API key"})
		return
	}

	fmt.Printf("DEBUG: Successfully deleted API key %s from local DB\n", keyID)
	c.JSON(http.StatusOK, gin.H{"message": "API key deleted successfully"})
}

// GetUserBudget получает бюджет пользователя из LiteLLM
func (h *UserHandler) GetUserBudget(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Получаем все бюджеты и находим для данного пользователя
	budgets, err := h.litellmClient.ListBudgets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get budgets"})
		return
	}

	// Ищем бюджет для данного пользователя
	for _, budget := range budgets {
		if budget.UserID == userID {
			response := map[string]interface{}{
				"id":               budget.ID,
				"user_id":          budget.UserID,
				"monthly_limit":    budget.MaxBudget,
				"current_spending": budget.SpentBudget,
				"currency":         "USD",
				"created_at":       budget.CreatedAt,
				"updated_at":       budget.UpdatedAt,
			}

			c.JSON(http.StatusOK, response)
			return
		}
	}

	// Если бюджет не найден, возвращаем стандартный
	response := map[string]interface{}{
		"id":               "",
		"user_id":          userID,
		"monthly_limit":    100.0,
		"current_spending": 0.0,
		"currency":         "USD",
		"created_at":       "2024-01-01T00:00:00Z",
		"updated_at":       "2024-01-01T00:00:00Z",
	}

	c.JSON(http.StatusOK, response)
}

// UpdateUserBudget обновляет бюджет пользователя
func (h *UserHandler) UpdateUserBudget(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var req struct {
		MonthlyLimit float64 `json:"monthly_limit" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Создаем или обновляем бюджет в LiteLLM
	budgetReq := &litellm.LiteLLMBudgetRequest{
		UserID:         userID,
		MaxBudget:      &req.MonthlyLimit,
		BudgetDuration: "1mo",
	}

	budget, err := h.litellmClient.CreateBudget(c.Request.Context(), budgetReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update budget"})
		return
	}

	response := map[string]interface{}{
		"id":               budget.ID,
		"user_id":          budget.UserID,
		"monthly_limit":    budget.MaxBudget,
		"current_spending": budget.SpentBudget,
		"currency":         "USD",
		"created_at":       budget.CreatedAt,
		"updated_at":       budget.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// GetUsageStats получает статистику использования
func (h *UserHandler) GetUsageStats(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	period := c.DefaultQuery("period", "month")

	fmt.Printf("DEBUG: GetUsageStats called for user %s, period=%s\n", userID, period)

	// Получаем данные из LiteLLM
	usage, err := h.litellmClient.GetUsage(c.Request.Context(), userID)
	if err != nil {
		fmt.Printf("ERROR: Failed to get usage stats for user %s: %v\n", userID, err)

		// Возвращаем пустую статистику вместо ошибки
		response := map[string]interface{}{
			"period":       period,
			"total_cost":   0.0,
			"total_tokens": 0,
			"model":        "",
			"currency":     "USD",
		}
		c.JSON(http.StatusOK, response)
		return
	}

	fmt.Printf("DEBUG: Got usage stats for user %s: cost=%.6f, tokens=%d, model=%s\n",
		userID, usage.TotalCost, usage.TotalTokens, usage.Model)

	response := map[string]interface{}{
		"period":       period,
		"total_cost":   usage.TotalCost,
		"total_tokens": usage.TotalTokens,
		"model":        usage.Model,
		"currency":     "USD",
	}

	c.JSON(http.StatusOK, response)
}

// GetRequestHistory получает историю запросов из LiteLLM
func (h *UserHandler) GetRequestHistory(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	fmt.Printf("DEBUG: GetRequestHistory called for user %s, limit=%d, offset=%d\n", userID, limit, offset)

	// Получаем API ключи пользователя из локальной БД
	apiKeys, err := h.apiKeyRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		fmt.Printf("ERROR: Failed to get API keys for user %s: %v\n", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user API keys"})
		return
	}

	fmt.Printf("DEBUG: Found %d API keys for user %s\n", len(apiKeys), userID)

	if len(apiKeys) == 0 {
		fmt.Printf("DEBUG: No API keys found for user %s\n", userID)
		c.JSON(http.StatusOK, map[string]interface{}{
			"requests":    []map[string]interface{}{},
			"total_count": 0,
			"limit":       limit,
			"offset":      offset,
			"has_more":    false,
		})
		return
	}

	// Собираем логи со всех API ключей пользователя
	var allLogs []map[string]interface{}

	for i, apiKey := range apiKeys {
		fmt.Printf("DEBUG: Processing API key %d: name=%s, external_id=%s, has_original_key=%t\n",
			i+1, apiKey.Name, apiKey.ExternalID, apiKey.OriginalKey != "")

		var keyToUse string

		// Сначала пробуем использовать расшифрованный оригинальный ключ
		if apiKey.OriginalKey != "" {
			originalKey, err := auth.DecryptAPIKey(apiKey.OriginalKey)
			if err != nil {
				fmt.Printf("WARNING: Failed to decrypt API key %s: %v\n", apiKey.Name, err)
				// Если не удалось расшифровать, пробуем использовать ExternalID
				if apiKey.ExternalID != "" {
					keyToUse = apiKey.ExternalID
					fmt.Printf("DEBUG: Using ExternalID as fallback for key %s\n", apiKey.Name)
				} else {
					fmt.Printf("WARNING: No usable key found for %s, skipping\n", apiKey.Name)
					continue
				}
			} else {
				keyToUse = originalKey
				fmt.Printf("DEBUG: Using decrypted original key for %s\n", apiKey.Name)
			}
		} else if apiKey.ExternalID != "" {
			// Если нет оригинального ключа, пробуем ExternalID
			keyToUse = apiKey.ExternalID
			fmt.Printf("DEBUG: Using ExternalID for key %s (no original key)\n", apiKey.Name)
		} else {
			fmt.Printf("WARNING: No key available for %s, skipping\n", apiKey.Name)
			continue
		}

		fmt.Printf("DEBUG: Making request to LiteLLM with key: %s...\n", keyToUse[:min(10, len(keyToUse))])

		logs, err := h.litellmClient.GetSpendLogsByAPIKey(c.Request.Context(), keyToUse)
		if err != nil {
			fmt.Printf("WARNING: Failed to get logs for API key %s (key: %s...): %v\n",
				apiKey.Name, keyToUse[:min(10, len(keyToUse))], err)
			continue
		}

		fmt.Printf("DEBUG: Got %d logs for API key %s\n", len(logs), apiKey.Name)

		// Добавляем информацию об API ключе к каждому логу
		for _, log := range logs {
			log["api_key_name"] = apiKey.Name
			log["api_key_id"] = apiKey.ID
			log["api_key_preview"] = apiKey.ApiKeyPreview
			allLogs = append(allLogs, log)
		}
	}

	fmt.Printf("DEBUG: Total logs collected: %d\n", len(allLogs))

	// Сортируем по времени начала (новые сначала)
	sort.Slice(allLogs, func(i, j int) bool {
		timeI, _ := time.Parse(time.RFC3339, fmt.Sprintf("%v", allLogs[i]["startTime"]))
		timeJ, _ := time.Parse(time.RFC3339, fmt.Sprintf("%v", allLogs[j]["startTime"]))
		return timeI.After(timeJ)
	})

	// Применяем пагинацию
	start := offset
	end := offset + limit
	if start > len(allLogs) {
		start = len(allLogs)
	}
	if end > len(allLogs) {
		end = len(allLogs)
	}

	paginatedLogs := allLogs[start:end]

	fmt.Printf("DEBUG: Returning %d logs (paginated from %d to %d)\n", len(paginatedLogs), start, end)

	// Конвертируем в стандартный формат ответа
	response := make([]map[string]interface{}, 0, len(paginatedLogs))
	for _, log := range paginatedLogs {
		requestData := map[string]interface{}{
			"id":                    log["request_id"],
			"request_id":            log["request_id"],
			"call_type":             log["call_type"],
			"api_key":               log["api_key"],
			"api_key_name":          log["api_key_name"],
			"api_key_id":            log["api_key_id"],
			"api_key_preview":       log["api_key_preview"],
			"model":                 log["model"],
			"model_group":           log["model_group"],
			"custom_llm_provider":   log["custom_llm_provider"],
			"user":                  log["user"],
			"cost":                  log["spend"],
			"spend":                 log["spend"],
			"total_tokens":          log["total_tokens"],
			"input_tokens":          log["prompt_tokens"],
			"output_tokens":         log["completion_tokens"],
			"prompt_tokens":         log["prompt_tokens"],
			"completion_tokens":     log["completion_tokens"],
			"start_time":            log["startTime"],
			"end_time":              log["endTime"],
			"completion_start_time": log["completionStartTime"],
			"created_at":            log["startTime"],
			"session_id":            log["session_id"],
			"status":                log["status"],
			"cache_hit":             log["cache_hit"],
			"cache_key":             log["cache_key"],
			"request_tags":          log["request_tags"],
			"team_id":               log["team_id"],
			"end_user":              log["end_user"],
			"requester_ip_address":  log["requester_ip_address"],
			"api_base":              log["api_base"],
		}

		// Добавляем метаданные если они есть
		if metadata, ok := log["metadata"]; ok {
			requestData["metadata"] = metadata
		}

		// Добавляем данные запроса и ответа если они есть
		if messages, ok := log["messages"]; ok {
			requestData["messages"] = messages
		}
		if response_data, ok := log["response"]; ok {
			requestData["response"] = response_data
		}
		if proxyServerRequest, ok := log["proxy_server_request"]; ok {
			requestData["proxy_server_request"] = proxyServerRequest
		}

		response = append(response, requestData)
	}

	// Добавляем информацию о пагинации
	result := map[string]interface{}{
		"requests":    response,
		"total_count": len(allLogs),
		"limit":       limit,
		"offset":      offset,
		"has_more":    end < len(allLogs),
	}

	c.JSON(http.StatusOK, result)
}

// Вспомогательная функция min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
