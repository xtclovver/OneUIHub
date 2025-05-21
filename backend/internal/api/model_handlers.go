package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oneaihub/backend/internal/service"
)

// ModelHandlers содержит обработчики для работы с моделями
type ModelHandlers struct {
	modelService     service.ModelService
	modelSyncService service.ModelSyncService
}

// NewModelHandlers создает новые обработчики для моделей
func NewModelHandlers(modelService service.ModelService, modelSyncService service.ModelSyncService) *ModelHandlers {
	return &ModelHandlers{
		modelService:     modelService,
		modelSyncService: modelSyncService,
	}
}

// RegisterRoutes регистрирует обработчики маршрутов
func (h *ModelHandlers) RegisterRoutes(r chi.Router) {
	r.Get("/models", h.GetModels)
	r.Get("/models/{id}", h.GetModelByID)
	r.Get("/companies", h.GetCompanies)
	r.Get("/companies/{id}/models", h.GetCompanyModels)

	// Административные маршруты
	r.Route("/admin", func(r chi.Router) {
		r.Post("/sync/models", h.SyncModels)
		r.Post("/sync/companies", h.SyncCompanies)
		r.Get("/models", h.GetAllModelsAdmin)
		r.Post("/model-configs", h.CreateModelConfig)
		r.Put("/model-configs/{id}", h.UpdateModelConfig)
	})
}

// GetModels возвращает список всех моделей
func (h *ModelHandlers) GetModels(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	models, err := h.modelService.GetAllModels(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список моделей", http.StatusInternalServerError)
		return
	}

	respondJSON(w, models, http.StatusOK)
}

// GetModelByID возвращает модель по ID
func (h *ModelHandlers) GetModelByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	model, err := h.modelService.GetModelByID(ctx, id)
	if err != nil {
		http.Error(w, "Модель не найдена", http.StatusNotFound)
		return
	}

	respondJSON(w, model, http.StatusOK)
}

// GetCompanies возвращает список всех компаний
func (h *ModelHandlers) GetCompanies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companies, err := h.modelService.GetAllCompanies(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список компаний", http.StatusInternalServerError)
		return
	}

	respondJSON(w, companies, http.StatusOK)
}

// GetCompanyModels возвращает список моделей конкретной компании
func (h *ModelHandlers) GetCompanyModels(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID := chi.URLParam(r, "id")

	models, err := h.modelService.GetModelsByCompanyID(ctx, companyID)
	if err != nil {
		http.Error(w, "Не удалось получить модели компании", http.StatusInternalServerError)
		return
	}

	respondJSON(w, models, http.StatusOK)
}

// SyncModels синхронизирует модели с LiteLLM
func (h *ModelHandlers) SyncModels(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if err := h.modelSyncService.SyncModels(ctx); err != nil {
		http.Error(w, "Не удалось синхронизировать модели", http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]string{"status": "success"}, http.StatusOK)
}

// SyncCompanies синхронизирует компании с LiteLLM
func (h *ModelHandlers) SyncCompanies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if err := h.modelSyncService.SyncCompanies(ctx); err != nil {
		http.Error(w, "Не удалось синхронизировать компании", http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]string{"status": "success"}, http.StatusOK)
}

// GetAllModelsAdmin возвращает список всех моделей для админ-панели
func (h *ModelHandlers) GetAllModelsAdmin(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	models, err := h.modelService.GetAllModelsWithConfigs(ctx)
	if err != nil {
		http.Error(w, "Не удалось получить список моделей", http.StatusInternalServerError)
		return
	}

	respondJSON(w, models, http.StatusOK)
}

// ModelConfigRequest запрос на создание/обновление конфигурации модели
type ModelConfigRequest struct {
	ModelID         string  `json:"model_id"`
	IsFree          bool    `json:"is_free"`
	IsEnabled       bool    `json:"is_enabled"`
	InputTokenCost  float64 `json:"input_token_cost"`
	OutputTokenCost float64 `json:"output_token_cost"`
}

// CreateModelConfig создает новую конфигурацию модели
func (h *ModelHandlers) CreateModelConfig(w http.ResponseWriter, r *http.Request) {
	var req ModelConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	config, err := h.modelService.CreateModelConfig(ctx, req.ModelID, req.IsFree, req.IsEnabled, req.InputTokenCost, req.OutputTokenCost)
	if err != nil {
		http.Error(w, "Не удалось создать конфигурацию модели", http.StatusInternalServerError)
		return
	}

	respondJSON(w, config, http.StatusCreated)
}

// UpdateModelConfig обновляет конфигурацию модели
func (h *ModelHandlers) UpdateModelConfig(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req ModelConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	config, err := h.modelService.UpdateModelConfigParams(ctx, id, req.IsFree, req.IsEnabled, req.InputTokenCost, req.OutputTokenCost)
	if err != nil {
		http.Error(w, "Не удалось обновить конфигурацию модели", http.StatusInternalServerError)
		return
	}

	respondJSON(w, config, http.StatusOK)
}

// Вспомогательная функция для отправки JSON ответа
func respondJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Ошибка при формировании ответа", http.StatusInternalServerError)
	}
}
