package handlers

import (
	"net/http"

	"oneui-hub/internal/service"

	"github.com/gin-gonic/gin"
)

type CurrencyHandler struct {
	currencyService service.CurrencyService
}

func NewCurrencyHandler(currencyService service.CurrencyService) *CurrencyHandler {
	return &CurrencyHandler{
		currencyService: currencyService,
	}
}

// GetSupportedCurrencies получает список поддерживаемых валют
func (h *CurrencyHandler) GetSupportedCurrencies(c *gin.Context) {
	currencies, err := h.currencyService.GetSupportedCurrencies(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": currencies,
	})
}

// GetExchangeRates получает курсы валют
func (h *CurrencyHandler) GetExchangeRates(c *gin.Context) {
	fromCurrency := c.Query("from")
	toCurrency := c.Query("to")

	if fromCurrency != "" && toCurrency != "" {
		// Получить конкретный курс
		rate, err := h.currencyService.GetExchangeRate(c.Request.Context(), fromCurrency, toCurrency)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exchange rate not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"from_currency": fromCurrency,
				"to_currency":   toCurrency,
				"rate":          rate,
			},
		})
		return
	}

	// Получить все курсы
	rates, err := h.currencyService.GetAllExchangeRates(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": rates,
	})
}

// ConvertCurrency конвертирует сумму из одной валюты в другую
func (h *CurrencyHandler) ConvertCurrency(c *gin.Context) {
	var request struct {
		Amount       float64 `json:"amount" binding:"required"`
		FromCurrency string  `json:"from_currency" binding:"required"`
		ToCurrency   string  `json:"to_currency" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	convertedAmount, err := h.currencyService.ConvertCurrency(
		c.Request.Context(),
		request.Amount,
		request.FromCurrency,
		request.ToCurrency,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"original_amount":  request.Amount,
		"from_currency":    request.FromCurrency,
		"converted_amount": convertedAmount,
		"to_currency":      request.ToCurrency,
	})
}

// UpdateExchangeRates обновляет курсы валют из внешнего API
func (h *CurrencyHandler) UpdateExchangeRates(c *gin.Context) {
	err := h.currencyService.UpdateExchangeRates(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Exchange rates updated successfully",
	})
}
