package service

import (
	"context"
	"fmt"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/repository"
)

type TierService interface {
	GetUserTier(ctx context.Context, userID string) (*domain.Tier, error)
	CheckAndUpgradeTier(ctx context.Context, userID string) error
	GetAllTiers(ctx context.Context) ([]domain.Tier, error)
	UpdateUserSpending(ctx context.Context, userID string, amount float64) error
	GetUserSpending(ctx context.Context, userID string) (*domain.UserSpending, error)
}

type tierService struct {
	tierRepo         repository.TierRepository
	userRepo         repository.UserRepository
	userSpendingRepo repository.UserSpendingRepository
}

func NewTierService(tierRepo repository.TierRepository, userRepo repository.UserRepository, userSpendingRepo repository.UserSpendingRepository) TierService {
	return &tierService{
		tierRepo:         tierRepo,
		userRepo:         userRepo,
		userSpendingRepo: userSpendingRepo,
	}
}

func (s *tierService) GetUserTier(ctx context.Context, userID string) (*domain.Tier, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	tier, err := s.tierRepo.GetByID(ctx, user.TierID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user tier: %w", err)
	}

	return tier, nil
}

func (s *tierService) CheckAndUpgradeTier(ctx context.Context, userID string) error {
	// Получаем текущие траты пользователя
	spending, err := s.userSpendingRepo.GetByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user spending: %w", err)
	}

	// Получаем текущий тариф пользователя
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Получаем все тарифы, отсортированные по price (по возрастанию)
	allTiers, err := s.tierRepo.GetAllOrderedByPrice(ctx)
	if err != nil {
		return fmt.Errorf("failed to get all tiers: %w", err)
	}

	// Определяем подходящий тариф на основе трат
	var newTierID string
	for _, tier := range allTiers {
		if spending.TotalSpent >= tier.Price {
			newTierID = tier.ID
		} else {
			break
		}
	}

	// Если нужно обновить тариф
	if newTierID != "" && newTierID != user.TierID {
		user.TierID = newTierID
		if err := s.userRepo.Update(ctx, user); err != nil {
			return fmt.Errorf("failed to update user tier: %w", err)
		}
	}

	return nil
}

func (s *tierService) GetAllTiers(ctx context.Context) ([]domain.Tier, error) {
	tiers, err := s.tierRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all tiers: %w", err)
	}

	return tiers, nil
}

func (s *tierService) UpdateUserSpending(ctx context.Context, userID string, amount float64) error {
	// Получаем или создаем запись трат
	spending, err := s.userSpendingRepo.GetByUserID(ctx, userID)
	if err != nil {
		// Если записи нет, создаем новую
		spending = &domain.UserSpending{
			UserID:     userID,
			TotalSpent: amount,
		}
		if err := s.userSpendingRepo.Create(ctx, spending); err != nil {
			return fmt.Errorf("failed to create user spending: %w", err)
		}
	} else {
		// Обновляем существующую запись
		spending.TotalSpent += amount
		if err := s.userSpendingRepo.Update(ctx, spending); err != nil {
			return fmt.Errorf("failed to update user spending: %w", err)
		}
	}

	// Проверяем, нужно ли повысить тариф
	if err := s.CheckAndUpgradeTier(ctx, userID); err != nil {
		return fmt.Errorf("failed to check and upgrade tier: %w", err)
	}

	return nil
}

func (s *tierService) GetUserSpending(ctx context.Context, userID string) (*domain.UserSpending, error) {
	spending, err := s.userSpendingRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user spending: %w", err)
	}

	return spending, nil
}
