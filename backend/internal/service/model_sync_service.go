package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/litellm"
	"github.com/oneaihub/backend/internal/repository"
)

// modelSyncService реализация ModelSyncService
type modelSyncService struct {
	litellmClient   litellm.LiteLLMClient
	modelRepo       repository.ModelRepository
	companyRepo     repository.CompanyRepository
	modelConfigRepo repository.ModelConfigRepository
}

// NewModelSyncService создает новый сервис синхронизации моделей
func NewModelSyncService(
	litellmClient litellm.LiteLLMClient,
	modelRepo repository.ModelRepository,
	companyRepo repository.CompanyRepository,
	modelConfigRepo repository.ModelConfigRepository,
) ModelSyncService {
	return &modelSyncService{
		litellmClient:   litellmClient,
		modelRepo:       modelRepo,
		companyRepo:     companyRepo,
		modelConfigRepo: modelConfigRepo,
	}
}

// SyncModels синхронизирует модели из LiteLLM
func (s *modelSyncService) SyncModels(ctx context.Context) error {
	litellmModels, err := s.litellmClient.GetModels(ctx)
	if err != nil {
		return fmt.Errorf("не удалось получить модели из LiteLLM: %w", err)
	}

	for _, litellmModel := range litellmModels {
		model, err := s.modelRepo.FindByExternalID(ctx, litellmModel.ExternalID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("не удалось проверить существование модели: %w", err)
		}

		// Если модель не существует, создаем новую
		if errors.Is(err, sql.ErrNoRows) {
			// Поиск или создание компании
			company, err := s.ensureCompanyExists(ctx, litellmModel.CompanyID)
			if err != nil {
				return fmt.Errorf("не удалось найти/создать компанию: %w", err)
			}

			// Создание новой модели
			newModel := &domain.Model{
				ID:          uuid.New().String(),
				CompanyID:   company.ID,
				Name:        litellmModel.Name,
				ExternalID:  litellmModel.ExternalID,
				Description: "Описание будет добавлено позже",
				Features:    "Список особенностей будет добавлен позже",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			if err := s.modelRepo.Create(ctx, newModel); err != nil {
				return fmt.Errorf("не удалось создать модель: %w", err)
			}

			// Создание базовой конфигурации модели
			defaultConfig := &domain.ModelConfig{
				ID:              uuid.New().String(),
				ModelID:         newModel.ID,
				IsEnabled:       true,
				IsFree:          false,
				InputTokenCost:  0.0001, // Значение по умолчанию
				OutputTokenCost: 0.0002, // Значение по умолчанию
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			}

			if err := s.modelConfigRepo.Create(ctx, defaultConfig); err != nil {
				return fmt.Errorf("не удалось создать конфигурацию модели: %w", err)
			}
		} else {
			// Обновляем существующую модель
			model.Name = litellmModel.Name
			model.UpdatedAt = time.Now()

			if err := s.modelRepo.Update(ctx, model); err != nil {
				return fmt.Errorf("не удалось обновить модель: %w", err)
			}
		}
	}

	return nil
}

// SyncCompanies синхронизирует компании из LiteLLM
func (s *modelSyncService) SyncCompanies(ctx context.Context) error {
	litellmCompanies, err := s.litellmClient.GetProviders(ctx)
	if err != nil {
		return fmt.Errorf("не удалось получить компании из LiteLLM: %w", err)
	}

	for _, litellmCompany := range litellmCompanies {
		company, err := s.companyRepo.FindByExternalID(ctx, litellmCompany.ExternalID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("не удалось проверить существование компании: %w", err)
		}

		// Если компания не существует, создаем новую
		if errors.Is(err, sql.ErrNoRows) {
			newCompany := &domain.Company{
				ID:          uuid.New().String(),
				Name:        litellmCompany.Name,
				ExternalID:  litellmCompany.ExternalID,
				Description: "Описание будет добавлено позже",
				LogoURL:     "", // Будет добавлено позже
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			if err := s.companyRepo.Create(ctx, newCompany); err != nil {
				return fmt.Errorf("не удалось создать компанию: %w", err)
			}
		} else {
			// Обновляем существующую компанию
			company.Name = litellmCompany.Name
			company.UpdatedAt = time.Now()

			if err := s.companyRepo.Update(ctx, company); err != nil {
				return fmt.Errorf("не удалось обновить компанию: %w", err)
			}
		}
	}

	return nil
}

// ensureCompanyExists проверяет существование компании по внешнему ID
// Если компания не существует, создает новую
func (s *modelSyncService) ensureCompanyExists(ctx context.Context, companyExternalID string) (*domain.Company, error) {
	company, err := s.companyRepo.FindByExternalID(ctx, companyExternalID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("не удалось проверить существование компании: %w", err)
	}

	if errors.Is(err, sql.ErrNoRows) {
		// Компания не существует, создаем новую
		newCompany := &domain.Company{
			ID:          uuid.New().String(),
			Name:        fmt.Sprintf("Компания %s", companyExternalID),
			ExternalID:  companyExternalID,
			Description: "Описание будет добавлено позже",
			LogoURL:     "", // Будет добавлено позже
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		if err := s.companyRepo.Create(ctx, newCompany); err != nil {
			return nil, fmt.Errorf("не удалось создать компанию: %w", err)
		}

		return newCompany, nil
	}

	return company, nil
}
