package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/service"
)

// TierHandlerImpl представляет обработчики запросов для тиров подписки
type TierHandlerImpl struct {
	tierService service.TierService
}

// NewTierHandlerImpl создает новый обработчик тиров
func NewTierHandlerImpl(tierService service.TierService) *TierHandlerImpl {
	return &TierHandlerImpl{
		tierService: tierService,
	}
}

// Create обрабатывает запрос на создание тира
func (h *TierHandlerImpl) Create(w http.ResponseWriter, r *http.Request) {
	var input domain.Tier

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tier, err := h.tierService.Create(r.Context(), &input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tier)
}

// Get обрабатывает запрос на получение тира по ID
func (h *TierHandlerImpl) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	tier, err := h.tierService.GetByID(r.Context(), id)
	if err != nil {
		if err.Error() == "tier not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tier)
}

// Update обрабатывает запрос на обновление тира
func (h *TierHandlerImpl) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var input domain.Tier

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tier, err := h.tierService.Update(r.Context(), id, &input)
	if err != nil {
		if err.Error() == "tier not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tier)
}

// Delete обрабатывает запрос на удаление тира
func (h *TierHandlerImpl) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	err := h.tierService.Delete(r.Context(), id)
	if err != nil {
		if err.Error() == "tier not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// List обрабатывает запрос на получение списка всех тиров
func (h *TierHandlerImpl) List(w http.ResponseWriter, r *http.Request) {
	tiers, err := h.tierService.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tiers)
}

// RegisterTierRoutesImpl регистрирует маршруты для тиров
func RegisterTierRoutesImpl(router chi.Router, tierHandler *TierHandlerImpl) {
	router.Route("/api/tiers", func(r chi.Router) {
		r.Get("/", tierHandler.List)
		r.Post("/", tierHandler.Create)
		r.Get("/{id}", tierHandler.Get)
		r.Put("/{id}", tierHandler.Update)
		r.Delete("/{id}", tierHandler.Delete)
	})
}
