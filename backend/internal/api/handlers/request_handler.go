package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"oneui-hub/internal/service"
)

type RequestHandler struct {
	requestService service.RequestService
}

func NewRequestHandler(requestService service.RequestService) *RequestHandler {
	return &RequestHandler{
		requestService: requestService,
	}
}

// GetAllRequests получает все запросы с пагинацией
func (h *RequestHandler) GetAllRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	offset := (page - 1) * limit

	requests, err := h.requestService.GetAllRequests(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"data":     requests,
			"page":     page,
			"limit":    limit,
			"total":    len(requests), // TODO: добавить подсчет общего количества
			"has_next": len(requests) == limit,
			"has_prev": page > 1,
		},
	})
}

// GetRequestsByUser получает запросы пользователя
func (h *RequestHandler) GetRequestsByUser(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	offset := (page - 1) * limit

	requests, err := h.requestService.GetRequestsByUserID(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"data":     requests,
			"page":     page,
			"limit":    limit,
			"total":    len(requests),
			"has_next": len(requests) == limit,
			"has_prev": page > 1,
		},
	})
}

// GetRequestsByModel получает запросы по модели
func (h *RequestHandler) GetRequestsByModel(c *gin.Context) {
	modelID := c.Param("model_id")
	if modelID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Model ID is required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	offset := (page - 1) * limit

	requests, err := h.requestService.GetRequestsByModelID(c.Request.Context(), modelID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"data":     requests,
			"page":     page,
			"limit":    limit,
			"total":    len(requests),
			"has_next": len(requests) == limit,
			"has_prev": page > 1,
		},
	})
}

// GetRequestByID получает запрос по ID
func (h *RequestHandler) GetRequestByID(c *gin.Context) {
	requestID := c.Param("request_id")
	if requestID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request ID is required"})
		return
	}

	request, err := h.requestService.GetRequestByID(c.Request.Context(), requestID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    request,
	})
}

// SyncUserRequests синхронизирует запросы пользователя из LiteLLM
func (h *RequestHandler) SyncUserRequests(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	err := h.requestService.SyncRequestsFromLiteLLM(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Requests synchronized successfully",
	})
}

// SyncAllRequests синхронизирует запросы всех пользователей из LiteLLM
func (h *RequestHandler) SyncAllRequests(c *gin.Context) {
	err := h.requestService.SyncAllUsersRequests(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All requests synchronized successfully",
	})
}
