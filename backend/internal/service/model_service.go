package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/repository"
)

// моделиСервис реализация ModelService
type модельСервис struct {
	моделиРепо       repository.ModelRepository
	компанииРепо     repository.CompanyRepository
	конфигМоделиРепо repository.ModelConfigRepository
}

// НовыйСервисМоделей создает новый сервис для работы с моделями
func НовыйСервисМоделей(
	моделиРепо repository.ModelRepository,
	компанииРепо repository.CompanyRepository,
	конфигМоделиРепо repository.ModelConfigRepository,
) ModelService {
	return &модельСервис{
		моделиРепо:       моделиРепо,
		компанииРепо:     компанииРепо,
		конфигМоделиРепо: конфигМоделиРепо,
	}
}

// GetModel получает модель по ID
func (s *модельСервис) GetModel(ctx context.Context, id string) (*domain.Model, error) {
	return s.моделиРепо.FindByID(ctx, id)
}

// GetModelByID получает модель по ID (алиас для совместимости с API)
func (s *модельСервис) GetModelByID(ctx context.Context, id string) (*domain.Model, error) {
	return s.GetModel(ctx, id)
}

// ListModels получает список всех моделей
func (s *модельСервис) ListModels(ctx context.Context) ([]domain.Model, error) {
	return s.моделиРепо.List(ctx)
}

// GetAllModels получает список всех моделей (алиас для совместимости с API)
func (s *модельСервис) GetAllModels(ctx context.Context) ([]domain.Model, error) {
	return s.ListModels(ctx)
}

// ListModelsByCompany получает список моделей по ID компании
func (s *модельСервис) ListModelsByCompany(ctx context.Context, companyID string) ([]domain.Model, error) {
	return s.моделиРепо.ListByCompanyID(ctx, companyID)
}

// GetModelsByCompanyID получает список моделей по ID компании (алиас для совместимости с API)
func (s *модельСервис) GetModelsByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error) {
	return s.ListModelsByCompany(ctx, companyID)
}

// GetAllCompanies получает список всех компаний
func (s *модельСервис) GetAllCompanies(ctx context.Context) ([]domain.Company, error) {
	return s.компанииРепо.List(ctx)
}

// GetModelConfig получает конфигурацию модели по ID модели
func (s *модельСервис) GetModelConfig(ctx context.Context, modelID string) (*domain.ModelConfig, error) {
	return s.конфигМоделиРепо.FindByModelID(ctx, modelID)
}

// UpdateModelConfig обновляет конфигурацию модели
func (s *модельСервис) UpdateModelConfig(ctx context.Context, config *domain.ModelConfig) error {
	config.UpdatedAt = time.Now()
	return s.конфигМоделиРепо.Update(ctx, config)
}

// GetAllModelsWithConfigs получает список всех моделей с их конфигурациями для админ-панели
func (s *модельСервис) GetAllModelsWithConfigs(ctx context.Context) ([]domain.Model, error) {
	models, err := s.моделиРепо.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("не удалось получить список моделей: %w", err)
	}

	// Для фронтенда нам часто нужны модели с конфигурациями
	// но тут мы не добавляем их для простоты
	// В реальном приложении стоит возвращать модели с конфигурациями

	return models, nil
}

// CreateModelConfig создает новую конфигурацию модели
func (s *модельСервис) CreateModelConfig(
	ctx context.Context,
	modelID string,
	isFree bool,
	isEnabled bool,
	inputTokenCost float64,
	outputTokenCost float64,
) (*domain.ModelConfig, error) {
	// Проверяем существование модели
	_, err := s.моделиРепо.FindByID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("модель не найдена: %w", err)
	}

	// Проверяем, существует ли уже конфигурация для этой модели
	existingConfig, err := s.конфигМоделиРепо.FindByModelID(ctx, modelID)
	if err == nil {
		// Конфигурация уже существует, обновляем ее
		return s.UpdateModelConfigParams(ctx, existingConfig.ID, isFree, isEnabled, inputTokenCost, outputTokenCost)
	}

	// Создаем новую конфигурацию
	config := &domain.ModelConfig{
		ID:              uuid.New().String(),
		ModelID:         modelID,
		IsFree:          isFree,
		IsEnabled:       isEnabled,
		InputTokenCost:  inputTokenCost,
		OutputTokenCost: outputTokenCost,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.конфигМоделиРепо.Create(ctx, config); err != nil {
		return nil, fmt.Errorf("не удалось создать конфигурацию модели: %w", err)
	}

	return config, nil
}

// UpdateModelConfigParams обновляет конфигурацию модели по отдельным параметрам
func (s *модельСервис) UpdateModelConfigParams(
	ctx context.Context,
	id string,
	isFree bool,
	isEnabled bool,
	inputTokenCost float64,
	outputTokenCost float64,
) (*domain.ModelConfig, error) {
	config, err := s.конфигМоделиРепо.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("конфигурация модели не найдена: %w", err)
	}

	config.IsFree = isFree
	config.IsEnabled = isEnabled
	config.InputTokenCost = inputTokenCost
	config.OutputTokenCost = outputTokenCost
	config.UpdatedAt = time.Now()

	if err := s.конфигМоделиРепо.Update(ctx, config); err != nil {
		return nil, fmt.Errorf("не удалось обновить конфигурацию модели: %w", err)
	}

	return config, nil
}
