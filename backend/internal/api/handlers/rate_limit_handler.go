package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/service"
)

type RateLimitHandler struct {
	rateLimitService service.RateLimitService
}

func NewRateLimitHandler(rateLimitService service.RateLimitService) *RateLimitHandler {
	return &RateLimitHandler{
		rateLimitService: rateLimitService,
	}
}

// Структуры запросов
type CreateRateLimitRequest struct {
	ModelID           string `json:"model_id" binding:"required"`
	TierID            string `json:"tier_id" binding:"required"`
	RequestsPerMinute int    `json:"requests_per_minute" binding:"min=0"`
	RequestsPerDay    int    `json:"requests_per_day" binding:"min=0"`
	TokensPerMinute   int    `json:"tokens_per_minute" binding:"min=0"`
	TokensPerDay      int    `json:"tokens_per_day" binding:"min=0"`
}

type UpdateRateLimitRequest struct {
	RequestsPerMinute *int `json:"requests_per_minute,omitempty" binding:"omitempty,min=0"`
	RequestsPerDay    *int `json:"requests_per_day,omitempty" binding:"omitempty,min=0"`
	TokensPerMinute   *int `json:"tokens_per_minute,omitempty" binding:"omitempty,min=0"`
	TokensPerDay      *int `json:"tokens_per_day,omitempty" binding:"omitempty,min=0"`
}

// GetAllRateLimits получает все лимиты
func (h *RateLimitHandler) GetAllRateLimits(c *gin.Context) {
	rateLimits, err := h.rateLimitService.GetAllRateLimits(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rateLimits,
	})
}

// GetRateLimitByID получает лимит по ID
func (h *RateLimitHandler) GetRateLimitByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	rateLimit, err := h.rateLimitService.GetRateLimitByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rateLimit,
	})
}

// CreateRateLimit создает новый лимит
func (h *RateLimitHandler) CreateRateLimit(c *gin.Context) {
	var req CreateRateLimitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	serviceReq := &service.CreateRateLimitRequest{
		ModelID:           req.ModelID,
		TierID:            req.TierID,
		RequestsPerMinute: req.RequestsPerMinute,
		RequestsPerDay:    req.RequestsPerDay,
		TokensPerMinute:   req.TokensPerMinute,
		TokensPerDay:      req.TokensPerDay,
	}

	rateLimit, err := h.rateLimitService.CreateRateLimit(c.Request.Context(), serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    rateLimit,
	})
}

// UpdateRateLimit обновляет лимит
func (h *RateLimitHandler) UpdateRateLimit(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	var req UpdateRateLimitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем существующий лимит
	rateLimit, err := h.rateLimitService.GetRateLimitByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rate limit not found"})
		return
	}

	// Обновляем поля
	if req.RequestsPerMinute != nil {
		rateLimit.RequestsPerMinute = *req.RequestsPerMinute
	}
	if req.RequestsPerDay != nil {
		rateLimit.RequestsPerDay = *req.RequestsPerDay
	}
	if req.TokensPerMinute != nil {
		rateLimit.TokensPerMinute = *req.TokensPerMinute
	}
	if req.TokensPerDay != nil {
		rateLimit.TokensPerDay = *req.TokensPerDay
	}

	if err := h.rateLimitService.UpdateRateLimit(c.Request.Context(), rateLimit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rateLimit,
	})
}

// DeleteRateLimit удаляет лимит
func (h *RateLimitHandler) DeleteRateLimit(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	if err := h.rateLimitService.DeleteRateLimit(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Rate limit deleted successfully",
	})
}

// GetRateLimitsByModel получает лимиты для модели
func (h *RateLimitHandler) GetRateLimitsByModel(c *gin.Context) {
	modelID := c.Param("model_id")
	if modelID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Model ID is required"})
		return
	}

	rateLimits, err := h.rateLimitService.GetRateLimitsByModelID(c.Request.Context(), modelID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rateLimits,
	})
}

// GetRateLimitsByTier получает лимиты для тарифа
func (h *RateLimitHandler) GetRateLimitsByTier(c *gin.Context) {
	tierID := c.Param("tier_id")
	if tierID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tier ID is required"})
		return
	}

	rateLimits, err := h.rateLimitService.GetRateLimitsByTierID(c.Request.Context(), tierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rateLimits,
	})
}
