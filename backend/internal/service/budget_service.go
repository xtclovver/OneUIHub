package service

import (
	"context"
	"fmt"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/repository"

	"github.com/google/uuid"
)

type BudgetService interface {
	// Методы для синхронизации с LiteLLM
	SyncBudgetsFromLiteLLM(ctx context.Context) error

	// CRUD операции
	GetAllBudgets(ctx context.Context) ([]*domain.Budget, error)
	GetBudgetByID(ctx context.Context, id string) (*domain.Budget, error)
	GetBudgetsByUserID(ctx context.Context, userID string) ([]*domain.Budget, error)
	CreateBudget(ctx context.Context, budget *domain.Budget) error
	UpdateBudget(ctx context.Context, budget *domain.Budget) error
	DeleteBudget(ctx context.Context, id string) error

	// Управление бюджетами в LiteLLM
	CreateLiteLLMBudget(ctx context.Context, req *litellm.LiteLLMBudgetRequest) (*litellm.LiteLLMBudgetResponse, error)
	UpdateLiteLLMBudget(ctx context.Context, req *litellm.LiteLLMBudgetUpdateRequest) (*litellm.LiteLLMBudgetResponse, error)
	DeleteLiteLLMBudget(ctx context.Context, budgetID string) error

	// Получение информации о бюджетах из LiteLLM
	GetLiteLLMBudgets(ctx context.Context) ([]*litellm.LiteLLMBudgetResponse, error)
	GetLiteLLMBudgetInfo(ctx context.Context, budgetID string) (*litellm.LiteLLMBudgetResponse, error)
	GetLiteLLMBudgetSettings(ctx context.Context) (map[string]interface{}, error)
}

type budgetService struct {
	budgetRepo    repository.BudgetRepository
	userRepo      repository.UserRepository
	litellmClient *litellm.Client
}

func NewBudgetService(
	budgetRepo repository.BudgetRepository,
	userRepo repository.UserRepository,
	litellmClient *litellm.Client,
) BudgetService {
	return &budgetService{
		budgetRepo:    budgetRepo,
		userRepo:      userRepo,
		litellmClient: litellmClient,
	}
}

func (s *budgetService) SyncBudgetsFromLiteLLM(ctx context.Context) error {
	// Получаем бюджеты из LiteLLM
	litellmBudgets, err := s.litellmClient.ListBudgets(ctx)
	if err != nil {
		return fmt.Errorf("failed to get budgets from LiteLLM: %w", err)
	}

	// Создаем или обновляем бюджеты в БД
	for _, lb := range litellmBudgets {
		existingBudget, err := s.budgetRepo.GetByExternalID(ctx, lb.ID)
		if err != nil && err != repository.ErrNotFound {
			return fmt.Errorf("failed to check budget: %w", err)
		}

		budget := &domain.Budget{
			MaxBudget:      lb.MaxBudget,
			SpentBudget:    lb.SpentBudget,
			BudgetDuration: lb.BudgetDuration,
			ResetAt:        lb.ResetAt,
			ExternalID:     lb.ID,
		}

		if lb.UserID != "" {
			budget.UserID = &lb.UserID
		}
		if lb.TeamID != "" {
			budget.TeamID = &lb.TeamID
		}

		if existingBudget == nil {
			budget.ID = uuid.New().String()
			if err := s.budgetRepo.Create(ctx, budget); err != nil {
				return fmt.Errorf("failed to create budget: %w", err)
			}
		} else {
			budget.ID = existingBudget.ID
			if err := s.budgetRepo.Update(ctx, budget); err != nil {
				return fmt.Errorf("failed to update budget: %w", err)
			}
		}
	}

	return nil
}

func (s *budgetService) GetAllBudgets(ctx context.Context) ([]*domain.Budget, error) {
	return s.budgetRepo.List(ctx, 1000, 0) // Получаем до 1000 бюджетов
}

func (s *budgetService) GetBudgetByID(ctx context.Context, id string) (*domain.Budget, error) {
	return s.budgetRepo.GetByID(ctx, id)
}

func (s *budgetService) GetBudgetsByUserID(ctx context.Context, userID string) ([]*domain.Budget, error) {
	return s.budgetRepo.GetByUserID(ctx, userID)
}

func (s *budgetService) CreateBudget(ctx context.Context, budget *domain.Budget) error {
	budget.ID = uuid.New().String()
	return s.budgetRepo.Create(ctx, budget)
}

func (s *budgetService) UpdateBudget(ctx context.Context, budget *domain.Budget) error {
	return s.budgetRepo.Update(ctx, budget)
}

func (s *budgetService) DeleteBudget(ctx context.Context, id string) error {
	// Получаем бюджет из БД
	budget, err := s.budgetRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get budget: %w", err)
	}

	// Удаляем из LiteLLM если есть ExternalID
	if budget.ExternalID != "" {
		if err := s.litellmClient.DeleteBudget(ctx, budget.ExternalID); err != nil {
			// Логируем ошибку, но не останавливаем удаление из БД
			fmt.Printf("Warning: failed to delete budget from LiteLLM: %v\n", err)
		}
	}

	// Удаляем из БД
	return s.budgetRepo.Delete(ctx, id)
}

func (s *budgetService) CreateLiteLLMBudget(ctx context.Context, req *litellm.LiteLLMBudgetRequest) (*litellm.LiteLLMBudgetResponse, error) {
	return s.litellmClient.CreateBudget(ctx, req)
}

func (s *budgetService) UpdateLiteLLMBudget(ctx context.Context, req *litellm.LiteLLMBudgetUpdateRequest) (*litellm.LiteLLMBudgetResponse, error) {
	return s.litellmClient.UpdateBudget(ctx, req)
}

func (s *budgetService) DeleteLiteLLMBudget(ctx context.Context, budgetID string) error {
	return s.litellmClient.DeleteBudget(ctx, budgetID)
}

func (s *budgetService) GetLiteLLMBudgets(ctx context.Context) ([]*litellm.LiteLLMBudgetResponse, error) {
	return s.litellmClient.ListBudgets(ctx)
}

func (s *budgetService) GetLiteLLMBudgetInfo(ctx context.Context, budgetID string) (*litellm.LiteLLMBudgetResponse, error) {
	return s.litellmClient.GetBudgetInfo(ctx, budgetID)
}

func (s *budgetService) GetLiteLLMBudgetSettings(ctx context.Context) (map[string]interface{}, error) {
	return s.litellmClient.GetBudgetSettings(ctx)
}
