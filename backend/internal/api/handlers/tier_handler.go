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

// GetAllTiers получает список всех тарифов
func (h *TierHandler) GetAllTiers(c *gin.Context) {
	tiers, err := h.tierService.GetAllTiers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tiers)
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
