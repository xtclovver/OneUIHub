package handlers

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/repository"
	"oneui-hub/internal/service"
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
			"id":          key.ID,
			"name":        key.Name,
			"external_id": key.ExternalID,
			"created_at":  key.CreatedAt.Format(time.RFC3339),
			"is_active":   true,
			"usage_count": 0, // TODO: получать из статистики LiteLLM
		}

		if key.ExpiresAt != nil {
			keyData["expires_at"] = key.ExpiresAt.Format(time.RFC3339)
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

	// Сохраняем информацию о ключе в локальную БД
	keyHash := fmt.Sprintf("%x", sha256.Sum256([]byte(keyResponse.Key)))
	apiKey := &domain.ApiKey{
		ID:         uuid.New().String(),
		UserID:     userID,
		KeyHash:    keyHash,
		ExternalID: keyResponse.KeyName,
		Name:       req.Name,
		CreatedAt:  time.Now(),
	}

	if err := h.apiKeyRepo.Create(c.Request.Context(), apiKey); err != nil {
		// Если не удалось сохранить в БД, удаляем ключ из LiteLLM
		_ = h.litellmClient.DeleteKey(c.Request.Context(), keyResponse.KeyName)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save API key"})
		return
	}

	response := map[string]interface{}{
		"id":          apiKey.ID,
		"name":        apiKey.Name,
		"api_key":     keyResponse.Key, // Возвращаем ключ только при создании
		"external_id": apiKey.ExternalID,
		"created_at":  apiKey.CreatedAt.Format(time.RFC3339),
		"is_active":   true,
		"usage_count": 0,
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

	// Получаем информацию о ключе из локальной БД
	apiKey, err := h.apiKeyRepo.GetByID(c.Request.Context(), keyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "API key not found"})
		return
	}

	// Удаляем ключ из LiteLLM
	if apiKey.ExternalID != "" {
		if err := h.litellmClient.DeleteKey(c.Request.Context(), apiKey.ExternalID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete API key from LiteLLM"})
			return
		}
	}

	// Удаляем ключ из локальной БД
	if err := h.apiKeyRepo.Delete(c.Request.Context(), keyID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete API key"})
		return
	}

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

	// Получаем данные из LiteLLM
	usage, err := h.litellmClient.GetUsage(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get usage stats"})
		return
	}

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

	// Получаем логи запросов из LiteLLM
	spendLogs, err := h.litellmClient.GetSpendLogs(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get request history"})
		return
	}

	// Конвертируем в формат ответа
	response := make([]map[string]interface{}, 0, len(spendLogs.Data))
	for _, log := range spendLogs.Data {
		requestData := map[string]interface{}{
			"id":            log.RequestID,
			"model":         log.Model,
			"model_group":   log.ModelGroup,
			"user_id":       log.UserID,
			"team_id":       log.TeamID,
			"api_key":       log.APIKey,
			"request_tags":  log.RequestTags,
			"cost":          log.Spend,
			"total_tokens":  log.TotalTokens,
			"input_tokens":  log.PromptTokens,
			"output_tokens": log.CompletionTokens,
			"start_time":    log.StartTime.Format(time.RFC3339),
			"end_time":      log.EndTime.Format(time.RFC3339),
			"status_code":   log.StatusCode,
			"created_at":    log.StartTime.Format(time.RFC3339),
		}

		// Добавляем данные запроса и ответа если они есть
		if log.RequestData != nil {
			requestData["request_data"] = log.RequestData
		}
		if log.ResponseData != nil {
			requestData["response_data"] = log.ResponseData
		}

		response = append(response, requestData)
	}

	c.JSON(http.StatusOK, response)
}
