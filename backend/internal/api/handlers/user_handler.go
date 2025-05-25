package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/litellm"
	"oneui-hub/internal/service"
)

type UserHandler struct {
	userService   *service.UserService
	litellmClient *litellm.Client
}

func NewUserHandler(userService *service.UserService, litellmClient *litellm.Client) *UserHandler {
	return &UserHandler{
		userService:   userService,
		litellmClient: litellmClient,
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

// GetUserApiKeys получает API ключи пользователя (заглушка, так как в LiteLLM нет endpoint для получения ключей по userID)
func (h *UserHandler) GetUserApiKeys(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Пока что возвращаем пустой массив, так как LiteLLM не предоставляет метод для получения ключей по пользователю
	// В реальном проекте нужно будет сохранять связь ключей с пользователями в своей БД
	response := []map[string]interface{}{}

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create API key"})
		return
	}

	response := map[string]interface{}{
		"id":          keyResponse.KeyName,
		"name":        keyResponse.KeyName,
		"api_key":     keyResponse.Key,
		"created_at":  "2024-01-01T00:00:00Z", // LiteLLM не возвращает дату создания
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

	err := h.litellmClient.DeleteKey(c.Request.Context(), keyID)
	if err != nil {
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

// GetRequestHistory получает историю запросов (заглушка)
func (h *UserHandler) GetRequestHistory(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	// LiteLLM не предоставляет подробную историю запросов через API
	// В реальном проекте это нужно будет логировать отдельно
	response := []map[string]interface{}{}

	_ = limit
	_ = offset

	c.JSON(http.StatusOK, response)
}
