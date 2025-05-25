package repository

import (
	"context"

	"backend/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*domain.User, error)
}

type TierRepository interface {
	Create(ctx context.Context, tier *domain.Tier) error
	GetByID(ctx context.Context, id string) (*domain.Tier, error)
	GetByName(ctx context.Context, name string) (*domain.Tier, error)
	Update(ctx context.Context, tier *domain.Tier) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]*domain.Tier, error)
	GetAll(ctx context.Context) ([]domain.Tier, error)
	GetAllOrderedByPrice(ctx context.Context) ([]domain.Tier, error)
}

type CompanyRepository interface {
	Create(ctx context.Context, company *domain.Company) error
	GetByID(ctx context.Context, id string) (*domain.Company, error)
	GetByExternalID(ctx context.Context, externalID string) (*domain.Company, error)
	Update(ctx context.Context, company *domain.Company) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*domain.Company, error)
}

type ModelRepository interface {
	Create(ctx context.Context, model *domain.Model) error
	GetByID(ctx context.Context, id string) (*domain.Model, error)
	GetByExternalID(ctx context.Context, externalID string) (*domain.Model, error)
	GetByCompanyID(ctx context.Context, companyID string, limit, offset int) ([]*domain.Model, error)
	Update(ctx context.Context, model *domain.Model) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*domain.Model, error)
}

type ModelConfigRepository interface {
	Create(ctx context.Context, config *domain.ModelConfig) error
	GetByID(ctx context.Context, id string) (*domain.ModelConfig, error)
	GetByModelID(ctx context.Context, modelID string) (*domain.ModelConfig, error)
	Update(ctx context.Context, config *domain.ModelConfig) error
	Delete(ctx context.Context, id string) error
}

type RateLimitRepository interface {
	Create(ctx context.Context, rateLimit *domain.RateLimit) error
	GetByID(ctx context.Context, id string) (*domain.RateLimit, error)
	GetByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error)
	GetByModelID(ctx context.Context, modelID string) ([]*domain.RateLimit, error)
	GetByTierID(ctx context.Context, tierID string) ([]*domain.RateLimit, error)
	Update(ctx context.Context, rateLimit *domain.RateLimit) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]*domain.RateLimit, error)
}

type ApiKeyRepository interface {
	Create(ctx context.Context, apiKey *domain.ApiKey) error
	GetByID(ctx context.Context, id string) (*domain.ApiKey, error)
	GetByUserID(ctx context.Context, userID string) ([]*domain.ApiKey, error)
	GetByKeyHash(ctx context.Context, keyHash string) (*domain.ApiKey, error)
	Update(ctx context.Context, apiKey *domain.ApiKey) error
	Delete(ctx context.Context, id string) error
}

type RequestRepository interface {
	Create(ctx context.Context, request *domain.Request) error
	GetByID(ctx context.Context, id string) (*domain.Request, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Request, error)
	GetByModelID(ctx context.Context, modelID string, limit, offset int) ([]*domain.Request, error)
	List(ctx context.Context, limit, offset int) ([]*domain.Request, error)
}

type UserLimitRepository interface {
	Create(ctx context.Context, userLimit *domain.UserLimit) error
	GetByUserID(ctx context.Context, userID string) (*domain.UserLimit, error)
	Update(ctx context.Context, userLimit *domain.UserLimit) error
	Delete(ctx context.Context, userID string) error
}

type BudgetRepository interface {
	Create(ctx context.Context, budget *domain.Budget) error
	GetByID(ctx context.Context, id string) (*domain.Budget, error)
	GetByExternalID(ctx context.Context, externalID string) (*domain.Budget, error)
	GetByUserID(ctx context.Context, userID string) ([]*domain.Budget, error)
	Update(ctx context.Context, budget *domain.Budget) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*domain.Budget, error)
}

type CurrencyRepository interface {
	Create(ctx context.Context, currency *domain.Currency) error
	GetByID(ctx context.Context, id string) (*domain.Currency, error)
	GetAll(ctx context.Context) ([]domain.Currency, error)
	Update(ctx context.Context, currency *domain.Currency) error
	Delete(ctx context.Context, id string) error
}

type ExchangeRateRepository interface {
	Create(ctx context.Context, rate *domain.ExchangeRate) error
	GetByID(ctx context.Context, id string) (*domain.ExchangeRate, error)
	GetRate(ctx context.Context, fromCurrency, toCurrency string) (*domain.ExchangeRate, error)
	Update(ctx context.Context, rate *domain.ExchangeRate) error
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context) ([]*domain.ExchangeRate, error)
}

type UserSpendingRepository interface {
	Create(ctx context.Context, spending *domain.UserSpending) error
	GetByUserID(ctx context.Context, userID string) (*domain.UserSpending, error)
	Update(ctx context.Context, spending *domain.UserSpending) error
	Delete(ctx context.Context, userID string) error
}
