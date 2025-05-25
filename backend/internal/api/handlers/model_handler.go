package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/service"
)

type ModelHandler struct {
	modelService service.ModelService
}

func NewModelHandler(modelService service.ModelService) *ModelHandler {
	return &ModelHandler{
		modelService: modelService,
	}
}

// Структуры запросов и ответов
type CreateModelRequest struct {
	CompanyID   string `json:"company_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Features    string `json:"features"`
}

type UpdateModelRequest struct {
	CompanyID   string `json:"company_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Features    string `json:"features"`
}

type LiteLLMModelRequest struct {
	ModelName     string                 `json:"model_name" binding:"required"`
	LiteLLMParams map[string]interface{} `json:"litellm_params" binding:"required"`
	ModelInfo     *LiteLLMModelInfo      `json:"model_info,omitempty"`
}

type LiteLLMModelInfo struct {
	ID         string   `json:"id,omitempty"`
	Mode       string   `json:"mode,omitempty"`
	InputCost  *float64 `json:"input_cost_per_token,omitempty"`
	OutputCost *float64 `json:"output_cost_per_token,omitempty"`
	MaxTokens  *int     `json:"max_tokens,omitempty"`
	BaseModel  string   `json:"base_model,omitempty"`
}

type LiteLLMModelUpdateRequest struct {
	ModelID   string            `json:"model_id" binding:"required"`
	ModelInfo *LiteLLMModelInfo `json:"model_info,omitempty"`
	ModelName string            `json:"model_name,omitempty"`
}

// Методы для синхронизации с LiteLLM
func (h *ModelHandler) SyncFromLiteLLM(c *gin.Context) {
	if err := h.modelService.SyncModelsFromLiteLLM(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Models synchronized successfully"})
}

func (h *ModelHandler) SyncFromModelGroup(c *gin.Context) {
	if err := h.modelService.SyncModelsFromModelGroup(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Models synchronized from model group successfully"})
}

func (h *ModelHandler) GetModelGroupInfo(c *gin.Context) {
	modelGroupInfo, err := h.modelService.GetModelGroupInfo(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": modelGroupInfo})
}

// CRUD операции для моделей в БД
func (h *ModelHandler) GetAllModels(c *gin.Context) {
	models, err := h.modelService.GetAllModels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"models": models})
}

func (h *ModelHandler) GetModelByID(c *gin.Context) {
	id := c.Param("id")

	model, err := h.modelService.GetModelByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"model": model})
}

func (h *ModelHandler) CreateModel(c *gin.Context) {
	var req CreateModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	model := &domain.Model{
		CompanyID:   req.CompanyID,
		Name:        req.Name,
		Description: req.Description,
		Features:    req.Features,
	}

	if err := h.modelService.CreateModel(c.Request.Context(), model); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"model": model})
}

func (h *ModelHandler) UpdateModel(c *gin.Context) {
	id := c.Param("id")

	var req UpdateModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем существующую модель
	model, err := h.modelService.GetModelByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model not found"})
		return
	}

	// Обновляем поля
	if req.CompanyID != "" {
		model.CompanyID = req.CompanyID
	}
	if req.Name != "" {
		model.Name = req.Name
	}
	if req.Description != "" {
		model.Description = req.Description
	}
	if req.Features != "" {
		model.Features = req.Features
	}

	if err := h.modelService.UpdateModel(c.Request.Context(), model); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"model": model})
}

func (h *ModelHandler) DeleteModel(c *gin.Context) {
	id := c.Param("id")

	if err := h.modelService.DeleteModel(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Model deleted successfully"})
}

// Методы для работы с LiteLLM API
func (h *ModelHandler) GetLiteLLMModels(c *gin.Context) {
	models, err := h.modelService.GetLiteLLMModels(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"models": models})
}

func (h *ModelHandler) GetLiteLLMModelInfo(c *gin.Context) {
	modelID := c.Param("model_id")

	model, err := h.modelService.GetLiteLLMModelInfo(c.Request.Context(), modelID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"model": model})
}

func (h *ModelHandler) CreateLiteLLMModel(c *gin.Context) {
	var req LiteLLMModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Конвертируем в структуру LiteLLM
	litellmReq := &litellm.LiteLLMModelRequest{
		ModelName:     req.ModelName,
		LiteLLMParams: req.LiteLLMParams,
	}

	if req.ModelInfo != nil {
		litellmReq.ModelInfo = &litellm.LiteLLMModelInfo{
			ID:         req.ModelInfo.ID,
			Mode:       req.ModelInfo.Mode,
			InputCost:  req.ModelInfo.InputCost,
			OutputCost: req.ModelInfo.OutputCost,
			MaxTokens:  req.ModelInfo.MaxTokens,
			BaseModel:  req.ModelInfo.BaseModel,
		}
	}

	if err := h.modelService.CreateLiteLLMModel(c.Request.Context(), litellmReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Model created successfully in LiteLLM"})
}

func (h *ModelHandler) UpdateLiteLLMModel(c *gin.Context) {
	var req LiteLLMModelUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Конвертируем в структуру LiteLLM
	litellmReq := &litellm.LiteLLMModelUpdateRequest{
		ModelID:   req.ModelID,
		ModelName: req.ModelName,
	}

	if req.ModelInfo != nil {
		litellmReq.ModelInfo = &litellm.LiteLLMModelInfo{
			ID:         req.ModelInfo.ID,
			Mode:       req.ModelInfo.Mode,
			InputCost:  req.ModelInfo.InputCost,
			OutputCost: req.ModelInfo.OutputCost,
			MaxTokens:  req.ModelInfo.MaxTokens,
			BaseModel:  req.ModelInfo.BaseModel,
		}
	}

	if err := h.modelService.UpdateLiteLLMModel(c.Request.Context(), litellmReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Model updated successfully in LiteLLM"})
}

func (h *ModelHandler) DeleteLiteLLMModel(c *gin.Context) {
	modelID := c.Param("model_id")

	if err := h.modelService.DeleteLiteLLMModel(c.Request.Context(), modelID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Model deleted successfully from LiteLLM"})
}
