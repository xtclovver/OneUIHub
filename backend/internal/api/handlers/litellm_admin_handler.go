package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/middleware"
)

type LiteLLMAdminHandler struct {
	litellmClient *litellm.Client
}

func NewLiteLLMAdminHandler(litellmClient *litellm.Client) *LiteLLMAdminHandler {
	return &LiteLLMAdminHandler{
		litellmClient: litellmClient,
	}
}

// GetModelGroupInfo получает информацию о группах моделей из LiteLLM
func (h *LiteLLMAdminHandler) GetModelGroupInfo(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	modelGroups, err := h.litellmClient.GetModelGroupInfo(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении информации о группах моделей"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": modelGroups})
}

// GetModelsInfo получает информацию о моделях из LiteLLM
func (h *LiteLLMAdminHandler) GetModelsInfo(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	models, err := h.litellmClient.GetModels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении информации о моделях"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": models})
}

// CreateModel создает модель в LiteLLM
func (h *LiteLLMAdminHandler) CreateModel(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	var req litellm.LiteLLMModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.litellmClient.CreateModel(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании модели"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Модель успешно создана"})
}

// UpdateModel обновляет модель в LiteLLM
func (h *LiteLLMAdminHandler) UpdateModel(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	var req litellm.LiteLLMModelUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.litellmClient.UpdateModel(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении модели"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Модель успешно обновлена"})
}

// DeleteModel удаляет модель из LiteLLM
func (h *LiteLLMAdminHandler) DeleteModel(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	modelID := c.Param("model_id")
	if modelID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID модели обязателен"})
		return
	}

	err := h.litellmClient.DeleteModel(c.Request.Context(), modelID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении модели"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Модель успешно удалена"})
}

// GetUserInfo получает информацию о пользователях из LiteLLM
func (h *LiteLLMAdminHandler) GetUserInfo(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	userInfo, err := h.litellmClient.GetUserInfo(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении информации о пользователях"})
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

// CreateUserKey создает ключ пользователя в LiteLLM
func (h *LiteLLMAdminHandler) CreateUserKey(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	var req litellm.LiteLLMKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	keyResponse, err := h.litellmClient.CreateKey(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании ключа пользователя"})
		return
	}

	c.JSON(http.StatusCreated, keyResponse)
}

// UpdateUserKey обновляет ключ пользователя в LiteLLM
func (h *LiteLLMAdminHandler) UpdateUserKey(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	keyID := c.Param("key_id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ключа обязателен"})
		return
	}

	var req litellm.LiteLLMKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.litellmClient.UpdateKey(c.Request.Context(), keyID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении ключа пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ключ пользователя успешно обновлен"})
}

// DeleteUserKey удаляет ключ пользователя из LiteLLM
func (h *LiteLLMAdminHandler) DeleteUserKey(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	keyID := c.Param("key_id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ключа обязателен"})
		return
	}

	err := h.litellmClient.DeleteKey(c.Request.Context(), keyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении ключа пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ключ пользователя успешно удален"})
}

// GetGlobalSpend получает глобальные расходы из LiteLLM
func (h *LiteLLMAdminHandler) GetGlobalSpend(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	globalSpend, err := h.litellmClient.GetGlobalSpend(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении глобальных расходов"})
		return
	}

	c.JSON(http.StatusOK, globalSpend)
}

// GetSpendLogs получает логи расходов из LiteLLM
func (h *LiteLLMAdminHandler) GetSpendLogs(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	// Получаем параметры запроса
	userID := c.Query("user_id")
	if userID == "" {
		userID = "all" // По умолчанию получаем все логи
	}

	limit := 100
	offset := 0

	spendLogs, err := h.litellmClient.GetSpendLogs(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении логов расходов"})
		return
	}

	c.JSON(http.StatusOK, spendLogs)
}

// GetGlobalActivity получает глобальную активность из LiteLLM
func (h *LiteLLMAdminHandler) GetGlobalActivity(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Параметры start_date и end_date обязательны"})
		return
	}

	globalActivity, err := h.litellmClient.GetGlobalActivity(c.Request.Context(), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении глобальной активности"})
		return
	}

	c.JSON(http.StatusOK, globalActivity)
}

// GetAdminStats получает агрегированную статистику для админ дашборда
func (h *LiteLLMAdminHandler) GetAdminStats(c *gin.Context) {
	// Проверяем права администратора
	userRole, exists := middleware.GetUserRole(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
		return
	}

	if userRole != domain.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
		return
	}

	// Получаем все необходимые данные параллельно
	type statsResult struct {
		models   []*litellm.LiteLLMModel
		userInfo *litellm.LiteLLMUserInfo
		spend    *litellm.LiteLLMGlobalSpend
		activity *litellm.LiteLLMGlobalActivity
		err      error
	}

	resultChan := make(chan statsResult, 1)

	go func() {
		var result statsResult

		// Получаем модели
		models, err := h.litellmClient.GetModels(c.Request.Context())
		if err != nil {
			result.err = err
			resultChan <- result
			return
		}
		result.models = models

		// Получаем информацию о пользователях
		userInfo, err := h.litellmClient.GetUserInfo(c.Request.Context())
		if err != nil {
			result.err = err
			resultChan <- result
			return
		}
		result.userInfo = userInfo

		// Получаем глобальные расходы
		spend, err := h.litellmClient.GetGlobalSpend(c.Request.Context())
		if err != nil {
			result.err = err
			resultChan <- result
			return
		}
		result.spend = spend

		// Получаем активность за последние 30 дней
		endDate := "2024-12-19"   // Текущая дата
		startDate := "2024-11-19" // 30 дней назад
		activity, err := h.litellmClient.GetGlobalActivity(c.Request.Context(), startDate, endDate)
		if err != nil {
			result.err = err
			resultChan <- result
			return
		}
		result.activity = activity

		resultChan <- result
	}()

	result := <-resultChan
	if result.err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении статистики админа"})
		return
	}

	// Формируем ответ
	stats := gin.H{
		"totalUsers":     len(result.userInfo.Keys),
		"activeModels":   len(result.models),
		"requestsToday":  0, // Нужно вычислить из activity
		"monthlyRevenue": result.spend.Spend,
		"totalSpend":     result.spend.Spend,
		"totalRequests":  result.activity.SumAPIRequests,
		"totalTokens":    result.activity.SumTotalTokens,
	}

	// Вычисляем запросы за сегодня
	for _, day := range result.activity.DailyData {
		if day.Date == "Dec 19" { // Сегодняшняя дата
			stats["requestsToday"] = day.APIRequests
			break
		}
	}

	c.JSON(http.StatusOK, stats)
}
