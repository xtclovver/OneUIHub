package handlers

import (
	"net/http"

	"oneui-hub/internal/service"

	"github.com/gin-gonic/gin"
)

type TierHandler struct {
	tierService service.TierService
}

func NewTierHandler(tierService service.TierService) *TierHandler {
	return &TierHandler{
		tierService: tierService,
	}
}

// Структуры запросов для административных методов
type CreateTierRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	IsFree      bool    `json:"is_free"`
	Price       float64 `json:"price" binding:"min=0"`
}

type UpdateTierRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	IsFree      *bool    `json:"is_free,omitempty"`
	Price       *float64 `json:"price,omitempty" binding:"omitempty,min=0"`
}

// GetAllTiers получает список всех тарифов
func (h *TierHandler) GetAllTiers(c *gin.Context) {
	tiers, err := h.tierService.GetAllTiers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tiers,
	})
}

// GetTierByID получает тариф по ID (административный метод)
func (h *TierHandler) GetTierByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	tier, err := h.tierService.GetTierByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tier,
	})
}

// CreateTier создает новый тариф (административный метод)
func (h *TierHandler) CreateTier(c *gin.Context) {
	var req CreateTierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	serviceReq := &service.CreateTierRequest{
		Name:        req.Name,
		Description: req.Description,
		IsFree:      req.IsFree,
		Price:       req.Price,
	}

	tier, err := h.tierService.CreateTier(c.Request.Context(), serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    tier,
	})
}

// UpdateTier обновляет тариф (административный метод)
func (h *TierHandler) UpdateTier(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	var req UpdateTierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем существующий тариф
	tier, err := h.tierService.GetTierByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tier not found"})
		return
	}

	// Обновляем поля
	if req.Name != nil {
		tier.Name = *req.Name
	}
	if req.Description != nil {
		tier.Description = *req.Description
	}
	if req.IsFree != nil {
		tier.IsFree = *req.IsFree
	}
	if req.Price != nil {
		tier.Price = *req.Price
	}

	if err := h.tierService.UpdateTier(c.Request.Context(), tier); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tier,
	})
}

// DeleteTier удаляет тариф (административный метод)
func (h *TierHandler) DeleteTier(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	if err := h.tierService.DeleteTier(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tier deleted successfully",
	})
}

// GetUserTier получает текущий тариф пользователя
func (h *TierHandler) GetUserTier(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	tier, err := h.tierService.GetUserTier(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tier)
}

// GetUserSpending получает информацию о тратах пользователя
func (h *TierHandler) GetUserSpending(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	spending, err := h.tierService.GetUserSpending(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, spending)
}

// UpdateUserSpending обновляет траты пользователя
func (h *TierHandler) UpdateUserSpending(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var request struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount must be positive"})
		return
	}

	err := h.tierService.UpdateUserSpending(c.Request.Context(), userID, request.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User spending updated successfully"})
}

// CheckAndUpgradeTier проверяет и обновляет тариф пользователя
func (h *TierHandler) CheckAndUpgradeTier(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	err := h.tierService.CheckAndUpgradeTier(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tier check completed"})
}
