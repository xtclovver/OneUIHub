package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/repository"
)

// TierServiceImpl управляет тирами подписки
type TierServiceImpl struct {
	tierRepo repository.TierRepository
}

// NewTierServiceImpl создает новый сервис для работы с тирами
func NewTierServiceImpl(tierRepo repository.TierRepository) TierService {
	return &TierServiceImpl{
		tierRepo: tierRepo,
	}
}

// Create создает новый тир
func (s *TierServiceImpl) Create(ctx context.Context, input *domain.Tier) (*domain.Tier, error) {
	// Генерируем UUID для нового тира
	input.ID = uuid.New().String()

	// Сохраняем тир в базе данных
	if err := s.tierRepo.Create(ctx, input); err != nil {
		return nil, fmt.Errorf("failed to create tier: %w", err)
	}

	return input, nil
}

// GetByID возвращает тир по ID
func (s *TierServiceImpl) GetByID(ctx context.Context, id string) (*domain.Tier, error) {
	tier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get tier: %w", err)
	}

	if tier == nil {
		return nil, fmt.Errorf("tier not found")
	}

	return tier, nil
}

// Update обновляет данные тира
func (s *TierServiceImpl) Update(ctx context.Context, id string, input *domain.Tier) (*domain.Tier, error) {
	// Проверяем существование тира
	existingTier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to check tier existence: %w", err)
	}

	if existingTier == nil {
		return nil, fmt.Errorf("tier not found")
	}

	// Обновляем данные
	input.ID = id
	if err := s.tierRepo.Update(ctx, input); err != nil {
		return nil, fmt.Errorf("failed to update tier: %w", err)
	}

	return input, nil
}

// Delete удаляет тир
func (s *TierServiceImpl) Delete(ctx context.Context, id string) error {
	// Проверяем существование тира
	existingTier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check tier existence: %w", err)
	}

	if existingTier == nil {
		return fmt.Errorf("tier not found")
	}

	// Удаляем тир
	if err := s.tierRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete tier: %w", err)
	}

	return nil
}

// List возвращает список всех тиров
func (s *TierServiceImpl) List(ctx context.Context) ([]domain.Tier, error) {
	tiers, err := s.tierRepo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list tiers: %w", err)
	}

	return tiers, nil
}
