package service

import (
	"context"
	"encoding/json"
	"fmt"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/repository"

	"github.com/google/uuid"
)

type ModelService interface {
	// Методы для синхронизации с LiteLLM
	SyncModelsFromLiteLLM(ctx context.Context) error
	SyncModelsFromModelGroup(ctx context.Context) error

	// CRUD операции для моделей
	GetAllModels(ctx context.Context) ([]*domain.Model, error)
	GetModelByID(ctx context.Context, id string) (*domain.Model, error)
	CreateModel(ctx context.Context, model *domain.Model) error
	UpdateModel(ctx context.Context, model *domain.Model) error
	DeleteModel(ctx context.Context, id string) error

	// CRUD операции для компаний
	GetAllCompanies(ctx context.Context) ([]*domain.Company, error)
	GetCompanyByID(ctx context.Context, id string) (*domain.Company, error)
	GetModelsByCompanyID(ctx context.Context, companyID string) ([]*domain.Model, error)

	// Управление моделями в LiteLLM
	CreateLiteLLMModel(ctx context.Context, req *litellm.LiteLLMModelRequest) error
	UpdateLiteLLMModel(ctx context.Context, req *litellm.LiteLLMModelUpdateRequest) error
	DeleteLiteLLMModel(ctx context.Context, modelID string) error

	// Получение информации о моделях из LiteLLM
	GetLiteLLMModels(ctx context.Context) ([]*litellm.LiteLLMModel, error)
	GetLiteLLMModelInfo(ctx context.Context, modelID string) (*litellm.LiteLLMModel, error)
	GetModelGroupInfo(ctx context.Context) (*litellm.LiteLLMModelGroupResponse, error)
}

type modelService struct {
	modelRepo       repository.ModelRepository
	companyRepo     repository.CompanyRepository
	modelConfigRepo repository.ModelConfigRepository
	litellmClient   *litellm.Client
}

func NewModelService(
	modelRepo repository.ModelRepository,
	companyRepo repository.CompanyRepository,
	modelConfigRepo repository.ModelConfigRepository,
	litellmClient *litellm.Client,
) ModelService {
	return &modelService{
		modelRepo:       modelRepo,
		companyRepo:     companyRepo,
		modelConfigRepo: modelConfigRepo,
		litellmClient:   litellmClient,
	}
}

func (s *modelService) SyncModelsFromLiteLLM(ctx context.Context) error {
	// Получаем модели из LiteLLM
	litellmModels, err := s.litellmClient.GetModels(ctx)
	if err != nil {
		return fmt.Errorf("failed to get models from LiteLLM: %w", err)
	}

	// Конвертируем в модели домена
	models, companies := s.litellmClient.ConvertToDomainModels(litellmModels)

	// Создаем компании если их нет
	for _, company := range companies {
		existingCompany, err := s.companyRepo.GetByExternalID(ctx, company.ExternalID)
		if err != nil && err != repository.ErrNotFound {
			return fmt.Errorf("failed to check company: %w", err)
		}

		if existingCompany == nil {
			company.ID = uuid.New().String()
			if err := s.companyRepo.Create(ctx, company); err != nil {
				return fmt.Errorf("failed to create company: %w", err)
			}
		} else {
			company.ID = existingCompany.ID
		}
	}

	// Создаем или обновляем модели
	for _, model := range models {
		// Ищем компанию по ExternalID
		var companyID string
		for _, company := range companies {
			if company.ExternalID == model.ExternalID {
				companyID = company.ID
				break
			}
		}
		model.CompanyID = companyID

		existingModel, err := s.modelRepo.GetByExternalID(ctx, model.ExternalID)
		if err != nil && err != repository.ErrNotFound {
			return fmt.Errorf("failed to check model: %w", err)
		}

		if existingModel == nil {
			model.ID = uuid.New().String()
			if err := s.modelRepo.Create(ctx, model); err != nil {
				return fmt.Errorf("failed to create model: %w", err)
			}
		} else {
			model.ID = existingModel.ID
			if err := s.modelRepo.Update(ctx, model); err != nil {
				return fmt.Errorf("failed to update model: %w", err)
			}
		}
	}

	return nil
}

// Вспомогательные методы

func (s *modelService) ensureCompanyExists(ctx context.Context, providerName string) (*domain.Company, error) {
	// Сначала пытаемся найти компанию по external_id
	company, err := s.companyRepo.GetByExternalID(ctx, providerName)
	if err != nil && err != repository.ErrNotFound {
		return nil, fmt.Errorf("failed to check company existence: %w", err)
	}

	if company != nil {
		return company, nil
	}

	// Если компании нет, создаем новую (администратор добавит логотип и описание позже)
	newCompany := &domain.Company{
		ID:          uuid.New().String(),
		Name:        providerName,
		ExternalID:  providerName,
		Description: fmt.Sprintf("AI провайдер %s", providerName),
	}

	if err := s.companyRepo.Create(ctx, newCompany); err != nil {
		return nil, fmt.Errorf("failed to create company: %w", err)
	}

	return newCompany, nil
}

func (s *modelService) convertModelGroupToModel(modelGroup litellm.LiteLLMModelGroup, companyID string) *domain.Model {
	// Конвертируем массивы в JSON строки
	providersJSON, _ := json.Marshal(modelGroup.Providers)
	openaiParamsJSON, _ := json.Marshal(modelGroup.SupportedOpenAIParams)

	return &domain.Model{
		CompanyID:                       companyID,
		Name:                            modelGroup.ModelGroup,
		ExternalID:                      modelGroup.ModelGroup,
		Description:                     fmt.Sprintf("Модель %s поддерживает режим %s", modelGroup.ModelGroup, modelGroup.Mode),
		Providers:                       string(providersJSON),
		MaxInputTokens:                  &modelGroup.MaxInputTokens,
		MaxOutputTokens:                 &modelGroup.MaxOutputTokens,
		Mode:                            modelGroup.Mode,
		SupportsParallelFunctionCalling: modelGroup.SupportsParallelFunctionCalling,
		SupportsVision:                  modelGroup.SupportsVision,
		SupportsWebSearch:               modelGroup.SupportsWebSearch,
		SupportsReasoning:               modelGroup.SupportsReasoning,
		SupportsFunctionCalling:         modelGroup.SupportsFunctionCalling,
		SupportedOpenAIParams:           string(openaiParamsJSON),
	}
}

func (s *modelService) createModelConfig(ctx context.Context, config *domain.ModelConfig) error {
	return s.modelConfigRepo.Create(ctx, config)
}

func (s *modelService) updateModelConfig(ctx context.Context, modelID string, inputCost, outputCost *float64) error {
	// Ищем существующую конфигурацию
	config, err := s.modelConfigRepo.GetByModelID(ctx, modelID)
	if err != nil && err != repository.ErrNotFound {
		return fmt.Errorf("failed to get model config: %w", err)
	}

	if config == nil {
		// Создаем новую конфигурацию
		config = &domain.ModelConfig{
			ID:              uuid.New().String(),
			ModelID:         modelID,
			IsFree:          false,
			IsEnabled:       true,
			InputTokenCost:  inputCost,
			OutputTokenCost: outputCost,
		}
		return s.modelConfigRepo.Create(ctx, config)
	}

	// Обновляем существующую
	config.InputTokenCost = inputCost
	config.OutputTokenCost = outputCost
	return s.modelConfigRepo.Update(ctx, config)
}

func (s *modelService) GetAllModels(ctx context.Context) ([]*domain.Model, error) {
	return s.modelRepo.List(ctx, 1000, 0) // Получаем до 1000 моделей
}

func (s *modelService) GetModelByID(ctx context.Context, id string) (*domain.Model, error) {
	return s.modelRepo.GetByID(ctx, id)
}

func (s *modelService) CreateModel(ctx context.Context, model *domain.Model) error {
	model.ID = uuid.New().String()
	return s.modelRepo.Create(ctx, model)
}

func (s *modelService) UpdateModel(ctx context.Context, model *domain.Model) error {
	return s.modelRepo.Update(ctx, model)
}

func (s *modelService) DeleteModel(ctx context.Context, id string) error {
	// Получаем модель из БД
	model, err := s.modelRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get model: %w", err)
	}

	// Удаляем из LiteLLM если есть ExternalID
	if model.ExternalID != "" {
		if err := s.litellmClient.DeleteModel(ctx, model.ExternalID); err != nil {
			// Логируем ошибку, но не останавливаем удаление из БД
			fmt.Printf("Warning: failed to delete model from LiteLLM: %v\n", err)
		}
	}

	// Удаляем из БД
	return s.modelRepo.Delete(ctx, id)
}

func (s *modelService) CreateLiteLLMModel(ctx context.Context, req *litellm.LiteLLMModelRequest) error {
	return s.litellmClient.CreateModel(ctx, req)
}

func (s *modelService) UpdateLiteLLMModel(ctx context.Context, req *litellm.LiteLLMModelUpdateRequest) error {
	return s.litellmClient.UpdateModel(ctx, req)
}

func (s *modelService) DeleteLiteLLMModel(ctx context.Context, modelID string) error {
	return s.litellmClient.DeleteModel(ctx, modelID)
}

func (s *modelService) GetLiteLLMModels(ctx context.Context) ([]*litellm.LiteLLMModel, error) {
	return s.litellmClient.GetModels(ctx)
}

func (s *modelService) GetLiteLLMModelInfo(ctx context.Context, modelID string) (*litellm.LiteLLMModel, error) {
	return s.litellmClient.GetModelInfo(ctx, modelID)
}

func (s *modelService) GetModelGroupInfo(ctx context.Context) (*litellm.LiteLLMModelGroupResponse, error) {
	return s.litellmClient.GetModelGroupInfo(ctx)
}

func (s *modelService) SyncModelsFromModelGroup(ctx context.Context) error {
	// Получаем информацию о model_group из LiteLLM
	modelGroupResponse, err := s.litellmClient.GetModelGroupInfo(ctx)
	if err != nil {
		return fmt.Errorf("failed to get model group info from LiteLLM: %w", err)
	}

	// Обрабатываем каждую model_group
	for _, modelGroup := range modelGroupResponse.Data {
		// Извлекаем провайдера из model_group
		// model_group имеет формат "provider/model-name"
		var providerName string
		if len(modelGroup.Providers) > 0 {
			providerName = modelGroup.Providers[0]
		}

		// Создаем или находим компанию
		company, err := s.ensureCompanyExists(ctx, providerName)
		if err != nil {
			return fmt.Errorf("failed to ensure company exists for provider %s: %w", providerName, err)
		}

		// Проверяем, существует ли модель в БД
		existingModel, err := s.modelRepo.GetByExternalID(ctx, modelGroup.ModelGroup)
		if err != nil && err != repository.ErrNotFound {
			return fmt.Errorf("failed to check model existence: %w", err)
		}

		// Конвертируем данные model_group в модель домена
		model := s.convertModelGroupToModel(modelGroup, company.ID)

		if existingModel == nil {
			// Создаем новую модель
			model.ID = uuid.New().String()
			if err := s.modelRepo.Create(ctx, model); err != nil {
				return fmt.Errorf("failed to create model: %w", err)
			}

			// Создаем конфигурацию модели
			modelConfig := &domain.ModelConfig{
				ID:              uuid.New().String(),
				ModelID:         model.ID,
				IsFree:          false, // По умолчанию платные
				IsEnabled:       true,
				InputTokenCost:  &modelGroup.InputCostPerToken,
				OutputTokenCost: &modelGroup.OutputCostPerToken,
			}

			if err := s.createModelConfig(ctx, modelConfig); err != nil {
				return fmt.Errorf("failed to create model config: %w", err)
			}
		} else {
			// Обновляем существующую модель
			model.ID = existingModel.ID
			if err := s.modelRepo.Update(ctx, model); err != nil {
				return fmt.Errorf("failed to update model: %w", err)
			}

			// Обновляем конфигурацию модели
			if err := s.updateModelConfig(ctx, model.ID, &modelGroup.InputCostPerToken, &modelGroup.OutputCostPerToken); err != nil {
				return fmt.Errorf("failed to update model config: %w", err)
			}
		}
	}

	return nil
}

// Методы для работы с компаниями

func (s *modelService) GetAllCompanies(ctx context.Context) ([]*domain.Company, error) {
	return s.companyRepo.List(ctx, 1000, 0) // Получаем до 1000 компаний
}

func (s *modelService) GetCompanyByID(ctx context.Context, id string) (*domain.Company, error) {
	return s.companyRepo.GetByID(ctx, id)
}

func (s *modelService) GetModelsByCompanyID(ctx context.Context, companyID string) ([]*domain.Model, error) {
	return s.modelRepo.GetByCompanyID(ctx, companyID, 1000, 0) // Получаем до 1000 моделей
}
