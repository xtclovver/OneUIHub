package repository

import (
	"context"

	"github.com/oneaihub/backend/internal/domain"
)

// UserRepository определяет методы работы с пользователями
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	FindByID(ctx context.Context, id string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]domain.User, error)
	Count(ctx context.Context) (int, error)
}

// TierRepository определяет методы работы с тирами
type TierRepository interface {
	Create(ctx context.Context, tier *domain.Tier) error
	FindByID(ctx context.Context, id string) (*domain.Tier, error)
	Update(ctx context.Context, tier *domain.Tier) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Tier, error)
}

// CompanyRepository определяет методы работы с компаниями
type CompanyRepository interface {
	Create(ctx context.Context, company *domain.Company) error
	FindByID(ctx context.Context, id string) (*domain.Company, error)
	FindByExternalID(ctx context.Context, externalID string) (*domain.Company, error)
	Update(ctx context.Context, company *domain.Company) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Company, error)
}

// ModelRepository определяет методы работы с моделями
type ModelRepository interface {
	Create(ctx context.Context, model *domain.Model) error
	FindByID(ctx context.Context, id string) (*domain.Model, error)
	FindByExternalID(ctx context.Context, externalID string) (*domain.Model, error)
	Update(ctx context.Context, model *domain.Model) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Model, error)
	ListByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error)
}

// ModelConfigRepository определяет методы работы с конфигурациями моделей
type ModelConfigRepository interface {
	Create(ctx context.Context, config *domain.ModelConfig) error
	FindByID(ctx context.Context, id string) (*domain.ModelConfig, error)
	FindByModelID(ctx context.Context, modelID string) (*domain.ModelConfig, error)
	Update(ctx context.Context, config *domain.ModelConfig) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.ModelConfig, error)
}

// RateLimitRepository определяет методы работы с ограничениями запросов
type RateLimitRepository interface {
	Create(ctx context.Context, rateLimit *domain.RateLimit) error
	FindByID(ctx context.Context, id string) (*domain.RateLimit, error)
	FindByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error)
	Update(ctx context.Context, rateLimit *domain.RateLimit) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.RateLimit, error)
	ListByModelID(ctx context.Context, modelID string) ([]domain.RateLimit, error)
	ListByTierID(ctx context.Context, tierID string) ([]domain.RateLimit, error)
}

// ApiKeyRepository определяет методы работы с API ключами
type ApiKeyRepository interface {
	Create(ctx context.Context, apiKey *domain.ApiKey) error
	FindByID(ctx context.Context, id string) (*domain.ApiKey, error)
	FindByUserID(ctx context.Context, userID string) ([]domain.ApiKey, error)
	FindByKeyHash(ctx context.Context, keyHash string) (*domain.ApiKey, error)
	Delete(ctx context.Context, id string) error
}

// RequestRepository определяет методы работы с запросами пользователей
type RequestRepository interface {
	Create(ctx context.Context, request *domain.Request) error
	FindByID(ctx context.Context, id string) (*domain.Request, error)
	ListByUserID(ctx context.Context, userID string, offset, limit int) ([]domain.Request, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
	ListByModelID(ctx context.Context, modelID string, offset, limit int) ([]domain.Request, error)
}

// UserLimitsRepository определяет методы работы с лимитами пользователей
type UserLimitsRepository interface {
	Create(ctx context.Context, limits *domain.UserLimits) error
	FindByUserID(ctx context.Context, userID string) (*domain.UserLimits, error)
	Update(ctx context.Context, limits *domain.UserLimits) error
	Delete(ctx context.Context, userID string) error
}
