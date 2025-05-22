package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/service"
)

// TierHandlers содержит обработчики для работы с тирами и ограничениями
type TierHandlers struct {
	tierService      service.TierService
	rateLimitService service.RateLimitService
}

// NewTierHandlers создает новые обработчики для тиров
func NewTierHandlers(tierService service.TierService, rateLimitService service.RateLimitService) *TierHandlers {
	return &TierHandlers{
		tierService:      tierService,
		rateLimitService: rateLimitService,
	}
}

// RegisterRoutes регистрирует обработчики маршрутов
func (h *TierHandlers) RegisterRoutes(r chi.Router) {
	r.Get("/tiers", h.GetTiers)
	r.Get("/rate-limits", h.GetRateLimits)

	// Административные маршруты
	r.Route("/admin", func(r chi.Router) {
		r.Get("/tiers", h.GetAllTiers)
		r.Post("/tiers", h.CreateTier)
		r.Put("/tiers/{id}", h.UpdateTier)
		r.Delete("/tiers/{id}", h.DeleteTier)

		r.Get("/rate-limits", h.GetAllRateLimits)
		r.Post("/rate-limits", h.CreateRateLimit)
		r.Put("/rate-limits/{id}", h.UpdateRateLimit)
		r.Delete("/rate-limits/{id}", h.DeleteRateLimit)
	})
}

// GetTiers возвращает список всех тиров для пользователей
func (h *TierHandlers) GetTiers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tiers, err := h.tierService.List(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список тиров", http.StatusInternalServerError)
		return
	}

	respondJSON(w, tiers, http.StatusOK)
}

// GetRateLimits возвращает список всех ограничений для пользователей
func (h *TierHandlers) GetRateLimits(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Опционально фильтруем по модели или тиру
	modelID := r.URL.Query().Get("model_id")
	tierID := r.URL.Query().Get("tier_id")

	var rateLimits []domain.RateLimit
	var err error

	if modelID != "" {
		rateLimits, err = h.rateLimitService.ListByModelID(ctx, modelID)
	} else if tierID != "" {
		rateLimits, err = h.rateLimitService.ListByTierID(ctx, tierID)
	} else {
		rateLimits, err = h.rateLimitService.List(ctx)
	}

	if err != nil {
		http.Error(w, "Не удалось получить список ограничений", http.StatusInternalServerError)
		return
	}

	respondJSON(w, rateLimits, http.StatusOK)
}

// GetAllTiers возвращает список всех тиров для администратора
func (h *TierHandlers) GetAllTiers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tiers, err := h.tierService.List(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список тиров", http.StatusInternalServerError)
		return
	}

	respondJSON(w, tiers, http.StatusOK)
}

// TierRequest запрос на создание/обновление тира
type TierRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	IsFree      bool    `json:"is_free"`
	Price       float64 `json:"price"`
}

// CreateTier создает новый тир
func (h *TierHandlers) CreateTier(w http.ResponseWriter, r *http.Request) {
	var req TierRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	tier := &domain.Tier{
		Name:        req.Name,
		Description: req.Description,
		IsFree:      req.IsFree,
		Price:       req.Price,
	}

	ctx := r.Context()
	createdTier, err := h.tierService.Create(ctx, tier)
	if err != nil {
		http.Error(w, "Не удалось создать тир", http.StatusInternalServerError)
		return
	}

	respondJSON(w, createdTier, http.StatusCreated)
}

// UpdateTier обновляет существующий тир
func (h *TierHandlers) UpdateTier(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req TierRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	tier := &domain.Tier{
		Name:        req.Name,
		Description: req.Description,
		IsFree:      req.IsFree,
		Price:       req.Price,
	}

	ctx := r.Context()
	updatedTier, err := h.tierService.Update(ctx, id, tier)
	if err != nil {
		http.Error(w, "Не удалось обновить тир", http.StatusInternalServerError)
		return
	}

	respondJSON(w, updatedTier, http.StatusOK)
}

// DeleteTier удаляет тир
func (h *TierHandlers) DeleteTier(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	ctx := r.Context()
	if err := h.tierService.Delete(ctx, id); err != nil {
		http.Error(w, "Не удалось удалить тир", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RateLimitRequest запрос на создание/обновление ограничений
type RateLimitRequest struct {
	ModelID           string `json:"model_id"`
	TierID            string `json:"tier_id"`
	RequestsPerMinute int    `json:"requests_per_minute"`
	RequestsPerDay    int    `json:"requests_per_day"`
	TokensPerMinute   int    `json:"tokens_per_minute"`
	TokensPerDay      int    `json:"tokens_per_day"`
}

// GetAllRateLimits возвращает список всех ограничений для администратора
func (h *TierHandlers) GetAllRateLimits(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	rateLimits, err := h.rateLimitService.List(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список ограничений", http.StatusInternalServerError)
		return
	}

	respondJSON(w, rateLimits, http.StatusOK)
}

// CreateRateLimit создает новое ограничение
func (h *TierHandlers) CreateRateLimit(w http.ResponseWriter, r *http.Request) {
	var req RateLimitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	rateLimit := &domain.RateLimit{
		ModelID:           req.ModelID,
		TierID:            req.TierID,
		RequestsPerMinute: req.RequestsPerMinute,
		RequestsPerDay:    req.RequestsPerDay,
		TokensPerMinute:   req.TokensPerMinute,
		TokensPerDay:      req.TokensPerDay,
	}

	ctx := r.Context()
	createdRateLimit, err := h.rateLimitService.Create(ctx, rateLimit)
	if err != nil {
		http.Error(w, "Не удалось создать ограничение", http.StatusInternalServerError)
		return
	}

	respondJSON(w, createdRateLimit, http.StatusCreated)
}

// UpdateRateLimit обновляет существующее ограничение
func (h *TierHandlers) UpdateRateLimit(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req RateLimitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	rateLimit := &domain.RateLimit{
		ModelID:           req.ModelID,
		TierID:            req.TierID,
		RequestsPerMinute: req.RequestsPerMinute,
		RequestsPerDay:    req.RequestsPerDay,
		TokensPerMinute:   req.TokensPerMinute,
		TokensPerDay:      req.TokensPerDay,
	}

	ctx := r.Context()
	updatedRateLimit, err := h.rateLimitService.Update(ctx, id, rateLimit)
	if err != nil {
		http.Error(w, "Не удалось обновить ограничение", http.StatusInternalServerError)
		return
	}

	respondJSON(w, updatedRateLimit, http.StatusOK)
}

// DeleteRateLimit удаляет ограничение
func (h *TierHandlers) DeleteRateLimit(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	ctx := r.Context()
	if err := h.rateLimitService.Delete(ctx, id); err != nil {
		http.Error(w, "Не удалось удалить ограничение", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
