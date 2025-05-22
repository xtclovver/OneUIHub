package repository

import (
	"context"

	"github.com/oneaihub/backend/internal/domain"
)

// TierRepository определяет методы для работы с тирами
type TierRepository interface {
	Create(ctx context.Context, tier *domain.Tier) error
	FindByID(ctx context.Context, id string) (*domain.Tier, error)
	Update(ctx context.Context, tier *domain.Tier) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Tier, error)
}
