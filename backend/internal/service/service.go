package service

import (
	"context"

	"github.com/oneaihub/backend/internal/domain"
)

// UserService определяет методы работы с пользователями
type UserService interface {
	Register(ctx context.Context, input *domain.UserRegister) (*domain.UserResponse, string, error)
	Login(ctx context.Context, input *domain.UserLogin) (*domain.UserResponse, string, error)
	GetByID(ctx context.Context, id string) (*domain.User, error)
	Update(ctx context.Context, id string, input *domain.User) (*domain.User, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]domain.User, int, error)
	GetLimits(ctx context.Context, userID string) (*domain.UserLimits, error)
}

// TierService определяет методы работы с тирами подписки
type TierService interface {
	Create(ctx context.Context, input *domain.Tier) (*domain.Tier, error)
	GetByID(ctx context.Context, id string) (*domain.Tier, error)
	Update(ctx context.Context, id string, input *domain.Tier) (*domain.Tier, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Tier, error)
}

// CompanyService определяет методы работы с компаниями
type CompanyService interface {
	Create(ctx context.Context, input *domain.Company) (*domain.Company, error)
	GetByID(ctx context.Context, id string) (*domain.Company, error)
	Update(ctx context.Context, id string, input *domain.Company) (*domain.Company, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Company, error)
}

// ModelService определяет методы работы с моделями
type ModelService interface {
	Create(ctx context.Context, input *domain.Model) (*domain.Model, error)
	GetByID(ctx context.Context, id string) (*domain.Model, error)
	Update(ctx context.Context, id string, input *domain.Model) (*domain.Model, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Model, error)
	ListByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error)

	// Дополнительные методы
	GetAllModels(ctx context.Context) ([]domain.Model, error)
	GetModelByID(ctx context.Context, id string) (*domain.Model, error)
	GetAllCompanies(ctx context.Context) ([]domain.Company, error)
	GetModelsByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error)
	GetAllModelsWithConfigs(ctx context.Context) ([]domain.ModelWithConfig, error)
	CreateModelConfig(ctx context.Context, modelID string, isFree, isEnabled bool, inputCost, outputCost float64) (*domain.ModelConfig, error)
	UpdateModelConfigParams(ctx context.Context, configID string, isFree, isEnabled bool, inputCost, outputCost float64) (*domain.ModelConfig, error)
}

// AuthService определяет методы аутентификации
type AuthService interface {
	Register(ctx context.Context, input *domain.UserRegister) (*domain.UserResponse, string, error)
	Login(ctx context.Context, input *domain.UserLogin) (*domain.UserResponse, string, error)
	ValidateToken(tokenString string) (string, error)
	GenerateToken(userID, email string) (string, error)
}

// RateLimitService определяет методы работы с ограничениями запросов
type RateLimitService interface {
	Create(ctx context.Context, input *domain.RateLimit) (*domain.RateLimit, error)
	GetByID(ctx context.Context, id string) (*domain.RateLimit, error)
	Update(ctx context.Context, id string, input *domain.RateLimit) (*domain.RateLimit, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.RateLimit, error)
	ListByModelID(ctx context.Context, modelID string) ([]domain.RateLimit, error)
	ListByTierID(ctx context.Context, tierID string) ([]domain.RateLimit, error)
	CheckLimit(ctx context.Context, userID, modelID string) (bool, error)
}

// ApiKeyService определяет методы работы с API ключами
type ApiKeyService interface {
	Create(ctx context.Context, userID, name string, expiresAt *string) (*domain.ApiKey, string, error)
	Delete(ctx context.Context, id string) error
	ListByUser(ctx context.Context, userID string) ([]domain.ApiKey, error)
}

// RequestService определяет методы работы с запросами пользователей
type RequestService interface {
	Create(ctx context.Context, request *domain.Request) error
	GetByID(ctx context.Context, id string) (*domain.Request, error)
	ListByUser(ctx context.Context, userID string, offset, limit int) ([]domain.Request, int, error)
}

// ModelSyncService определяет методы синхронизации моделей с LiteLLM
type ModelSyncService interface {
	SyncModels(ctx context.Context) error
	SyncCompanies(ctx context.Context) error
}

// LLMProxyService определяет методы проксирования запросов к моделям
type LLMProxyService interface {
	Completions(ctx context.Context, userID, modelID string, request map[string]interface{}) (map[string]interface{}, error)
}
