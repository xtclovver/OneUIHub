package repository

import (
	"context"

	"github.com/oneaihub/backend/internal/domain"
)

// UserRepository определяет методы для работы с пользователями
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	FindByID(ctx context.Context, id string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]domain.User, error)
	Count(ctx context.Context) (int, error)
}
