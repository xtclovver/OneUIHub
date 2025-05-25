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
