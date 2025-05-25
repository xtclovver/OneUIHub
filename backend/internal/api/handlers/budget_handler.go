package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/service"
)

type BudgetHandler struct {
	budgetService service.BudgetService
}

func NewBudgetHandler(budgetService service.BudgetService) *BudgetHandler {
	return &BudgetHandler{
		budgetService: budgetService,
	}
}

// Структуры запросов и ответов
type CreateBudgetRequest struct {
	UserID         *string    `json:"user_id"`
	TeamID         *string    `json:"team_id"`
	MaxBudget      float64    `json:"max_budget" binding:"required,gt=0"`
	BudgetDuration string     `json:"budget_duration"`
	ResetAt        *time.Time `json:"reset_at"`
}

type UpdateBudgetRequest struct {
	UserID         *string    `json:"user_id"`
	TeamID         *string    `json:"team_id"`
	MaxBudget      *float64   `json:"max_budget"`
	BudgetDuration *string    `json:"budget_duration"`
	ResetAt        *time.Time `json:"reset_at"`
}

type LiteLLMBudgetRequest struct {
	UserID         string     `json:"user_id,omitempty"`
	TeamID         string     `json:"team_id,omitempty"`
	MaxBudget      *float64   `json:"max_budget,omitempty"`
	BudgetDuration string     `json:"budget_duration,omitempty"`
	ResetAt        *time.Time `json:"reset_at,omitempty"`
}

type LiteLLMBudgetUpdateRequest struct {
	ID             string     `json:"id" binding:"required"`
	MaxBudget      *float64   `json:"max_budget,omitempty"`
	BudgetDuration *string    `json:"budget_duration,omitempty"`
	ResetAt        *time.Time `json:"reset_at,omitempty"`
}

// Методы для синхронизации с LiteLLM
func (h *BudgetHandler) SyncFromLiteLLM(c *gin.Context) {
	if err := h.budgetService.SyncBudgetsFromLiteLLM(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Budgets synchronized successfully"})
}

// CRUD операции для бюджетов в БД
func (h *BudgetHandler) GetAllBudgets(c *gin.Context) {
	budgets, err := h.budgetService.GetAllBudgets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budgets": budgets})
}

func (h *BudgetHandler) GetBudgetByID(c *gin.Context) {
	id := c.Param("id")

	budget, err := h.budgetService.GetBudgetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Budget not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budget": budget})
}

func (h *BudgetHandler) GetBudgetsByUserID(c *gin.Context) {
	userID := c.Param("user_id")

	budgets, err := h.budgetService.GetBudgetsByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budgets": budgets})
}

func (h *BudgetHandler) CreateBudget(c *gin.Context) {
	var req CreateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	budget := &domain.Budget{
		UserID:         req.UserID,
		TeamID:         req.TeamID,
		MaxBudget:      req.MaxBudget,
		BudgetDuration: req.BudgetDuration,
		ResetAt:        req.ResetAt,
	}

	if budget.BudgetDuration == "" {
		budget.BudgetDuration = "monthly"
	}

	if err := h.budgetService.CreateBudget(c.Request.Context(), budget); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"budget": budget})
}

func (h *BudgetHandler) UpdateBudget(c *gin.Context) {
	id := c.Param("id")

	var req UpdateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем существующий бюджет
	budget, err := h.budgetService.GetBudgetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Budget not found"})
		return
	}

	// Обновляем поля
	if req.UserID != nil {
		budget.UserID = req.UserID
	}
	if req.TeamID != nil {
		budget.TeamID = req.TeamID
	}
	if req.MaxBudget != nil {
		budget.MaxBudget = *req.MaxBudget
	}
	if req.BudgetDuration != nil {
		budget.BudgetDuration = *req.BudgetDuration
	}
	if req.ResetAt != nil {
		budget.ResetAt = req.ResetAt
	}

	if err := h.budgetService.UpdateBudget(c.Request.Context(), budget); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budget": budget})
}

func (h *BudgetHandler) DeleteBudget(c *gin.Context) {
	id := c.Param("id")

	if err := h.budgetService.DeleteBudget(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Budget deleted successfully"})
}

// Методы для работы с LiteLLM API
func (h *BudgetHandler) GetLiteLLMBudgets(c *gin.Context) {
	budgets, err := h.budgetService.GetLiteLLMBudgets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budgets": budgets})
}

func (h *BudgetHandler) GetLiteLLMBudgetInfo(c *gin.Context) {
	budgetID := c.Param("budget_id")

	budget, err := h.budgetService.GetLiteLLMBudgetInfo(c.Request.Context(), budgetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budget": budget})
}

func (h *BudgetHandler) GetLiteLLMBudgetSettings(c *gin.Context) {
	settings, err := h.budgetService.GetLiteLLMBudgetSettings(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

func (h *BudgetHandler) CreateLiteLLMBudget(c *gin.Context) {
	var req LiteLLMBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Конвертируем в структуру LiteLLM
	litellmReq := &litellm.LiteLLMBudgetRequest{
		UserID:         req.UserID,
		TeamID:         req.TeamID,
		MaxBudget:      req.MaxBudget,
		BudgetDuration: req.BudgetDuration,
		ResetAt:        req.ResetAt,
	}

	budget, err := h.budgetService.CreateLiteLLMBudget(c.Request.Context(), litellmReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"budget": budget})
}

func (h *BudgetHandler) UpdateLiteLLMBudget(c *gin.Context) {
	var req LiteLLMBudgetUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Конвертируем в структуру LiteLLM
	litellmReq := &litellm.LiteLLMBudgetUpdateRequest{
		ID:             req.ID,
		MaxBudget:      req.MaxBudget,
		BudgetDuration: req.BudgetDuration,
		ResetAt:        req.ResetAt,
	}

	budget, err := h.budgetService.UpdateLiteLLMBudget(c.Request.Context(), litellmReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"budget": budget})
}

func (h *BudgetHandler) DeleteLiteLLMBudget(c *gin.Context) {
	budgetID := c.Param("budget_id")

	if err := h.budgetService.DeleteLiteLLMBudget(c.Request.Context(), budgetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Budget deleted successfully from LiteLLM"})
}
