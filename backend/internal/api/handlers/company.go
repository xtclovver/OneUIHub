package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/service"
)

type CompanyHandler struct {
	modelService service.ModelService
}

func NewCompanyHandler(modelService service.ModelService) *CompanyHandler {
	return &CompanyHandler{
		modelService: modelService,
	}
}

// GetAllCompanies получает список всех компаний
func (h *CompanyHandler) GetAllCompanies(c *gin.Context) {
	companies, err := h.modelService.GetAllCompanies(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    companies,
		"success": true,
		"message": "Companies retrieved successfully",
	})
}

// GetCompanyByID получает компанию по ID
func (h *CompanyHandler) GetCompanyByID(c *gin.Context) {
	id := c.Param("id")

	company, err := h.modelService.GetCompanyByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    company,
		"success": true,
		"message": "Company retrieved successfully",
	})
}

// GetCompanyModels получает модели компании
func (h *CompanyHandler) GetCompanyModels(c *gin.Context) {
	companyID := c.Param("id")

	models, err := h.modelService.GetModelsByCompanyID(c.Request.Context(), companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    models,
		"success": true,
		"message": "Company models retrieved successfully",
	})
}

// Административные методы

// CreateCompany создает новую компанию
func (h *CompanyHandler) CreateCompany(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		LogoURL     string `json:"logo_url"`
		Description string `json:"description"`
		ExternalID  string `json:"external_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company, err := h.modelService.CreateCompany(c.Request.Context(), req.Name, req.LogoURL, req.Description, req.ExternalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    company,
		"success": true,
		"message": "Company created successfully",
	})
}

// UpdateCompany обновляет компанию
func (h *CompanyHandler) UpdateCompany(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Name        string `json:"name"`
		LogoURL     string `json:"logo_url"`
		Description string `json:"description"`
		ExternalID  string `json:"external_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company, err := h.modelService.UpdateCompany(c.Request.Context(), id, req.Name, req.LogoURL, req.Description, req.ExternalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    company,
		"success": true,
		"message": "Company updated successfully",
	})
}

// DeleteCompany удаляет компанию
func (h *CompanyHandler) DeleteCompany(c *gin.Context) {
	id := c.Param("id")

	if err := h.modelService.DeleteCompany(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Company deleted successfully",
	})
}

// SyncCompaniesFromLiteLLM синхронизирует компании из LiteLLM
func (h *CompanyHandler) SyncCompaniesFromLiteLLM(c *gin.Context) {
	if err := h.modelService.SyncCompaniesFromLiteLLM(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Companies synchronized successfully",
	})
}
