package repository

import (
	"context"

	"github.com/oneaihub/backend/internal/domain"
)

// CompanyRepository определяет методы для работы с компаниями
type CompanyRepository interface {
	Create(ctx context.Context, company *domain.Company) error
	FindByID(ctx context.Context, id string) (*domain.Company, error)
	FindByExternalID(ctx context.Context, externalID string) (*domain.Company, error)
	FindByName(ctx context.Context, name string) (*domain.Company, error)
	Update(ctx context.Context, company *domain.Company) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Company, error)
}

// ModelRepository определяет методы для работы с моделями
type ModelRepository interface {
	Create(ctx context.Context, model *domain.Model) error
	FindByID(ctx context.Context, id string) (*domain.Model, error)
	FindByExternalID(ctx context.Context, externalID string) (*domain.Model, error)
	FindByName(ctx context.Context, name string) (*domain.Model, error)
	Update(ctx context.Context, model *domain.Model) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Model, error)
	ListByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error)
}

// ModelConfigRepository определяет методы для работы с конфигурациями моделей
type ModelConfigRepository interface {
	Create(ctx context.Context, config *domain.ModelConfig) error
	FindByID(ctx context.Context, id string) (*domain.ModelConfig, error)
	FindByModelID(ctx context.Context, modelID string) (*domain.ModelConfig, error)
	Update(ctx context.Context, config *domain.ModelConfig) error
	Delete(ctx context.Context, modelID string) error
}

// RateLimitRepository определяет методы для работы с ограничениями скорости
type RateLimitRepository interface {
	Create(ctx context.Context, rateLimit *domain.RateLimit) error
	FindByID(ctx context.Context, id string) (*domain.RateLimit, error)
	FindByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error)
	Update(ctx context.Context, rateLimit *domain.RateLimit) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.RateLimit, error)
	ListByModelID(ctx context.Context, modelID string) ([]domain.RateLimit, error)
	ListByTierID(ctx context.Context, tierID string) ([]domain.RateLimit, error)
	Increment(ctx context.Context, key string, window int64) (int64, error)
	Get(ctx context.Context, key string) (int64, error)
}

// ApiKeyRepository определяет методы для работы с API ключами
type ApiKeyRepository interface {
	Create(ctx context.Context, apiKey *domain.ApiKey) error
	FindByID(ctx context.Context, id string) (*domain.ApiKey, error)
	FindByKey(ctx context.Context, key string) (*domain.ApiKey, error)
	FindByUserID(ctx context.Context, userID string) ([]domain.ApiKey, error)
	Delete(ctx context.Context, id string) error
}

// RequestRepository определяет методы для работы с запросами
type RequestRepository interface {
	Create(ctx context.Context, request *domain.Request) error
	FindByID(ctx context.Context, id string) (*domain.Request, error)
	FindByUserID(ctx context.Context, userID string, limit, offset int) ([]domain.Request, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
}

// UserLimitsRepository определяет методы для работы с лимитами пользователей
type UserLimitsRepository interface {
	Create(ctx context.Context, limits *domain.UserLimits) error
	GetByUserID(ctx context.Context, userID string) (*domain.UserLimits, error)
	FindByUserID(ctx context.Context, userID string) (*domain.UserLimits, error)
	Update(ctx context.Context, limits *domain.UserLimits) error
}
