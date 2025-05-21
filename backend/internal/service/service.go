package service

import (
	"context"
	"net/http"
	"time"

	"github.com/oneaihub/backend/internal/domain"
)

// UserService определяет методы работы с пользователями
type UserService interface {
	Register(ctx context.Context, email, password string, tierID string) (*domain.User, error)
	Login(ctx context.Context, email, password string) (string, error) // Возвращает JWT токен
	GetProfile(ctx context.Context, userID string) (*domain.User, error)
	UpdateProfile(ctx context.Context, userID string, user *domain.User) error
	ListUsers(ctx context.Context, offset, limit int) ([]domain.User, int, error) // Третий параметр - total count
	GetUserLimits(ctx context.Context, userID string) (*domain.UserLimits, error)
	ApproveFreeTier(ctx context.Context, userID string) error
}

// TierService определяет методы работы с тирами
type TierService interface {
	CreateTier(ctx context.Context, tier *domain.Tier) error
	GetTier(ctx context.Context, id string) (*domain.Tier, error)
	UpdateTier(ctx context.Context, tier *domain.Tier) error
	DeleteTier(ctx context.Context, id string) error
	ListTiers(ctx context.Context) ([]domain.Tier, error)
}

// CompanyService определяет методы работы с компаниями
type CompanyService interface {
	GetCompany(ctx context.Context, id string) (*domain.Company, error)
	ListCompanies(ctx context.Context) ([]domain.Company, error)
}

// ModelService определяет методы работы с моделями
type ModelService interface {
	GetModel(ctx context.Context, id string) (*domain.Model, error)
	ListModels(ctx context.Context) ([]domain.Model, error)
	ListModelsByCompany(ctx context.Context, companyID string) ([]domain.Model, error)
	GetModelConfig(ctx context.Context, modelID string) (*domain.ModelConfig, error)
	UpdateModelConfig(ctx context.Context, config *domain.ModelConfig) error
}

// RateLimitService определяет методы работы с ограничениями запросов
type RateLimitService interface {
	CreateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error
	GetRateLimit(ctx context.Context, id string) (*domain.RateLimit, error)
	GetRateLimitByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error)
	UpdateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error
	DeleteRateLimit(ctx context.Context, id string) error
	ListRateLimits(ctx context.Context) ([]domain.RateLimit, error)
	ListRateLimitsByModel(ctx context.Context, modelID string) ([]domain.RateLimit, error)
	ListRateLimitsByTier(ctx context.Context, tierID string) ([]domain.RateLimit, error)
	CheckRateLimit(ctx context.Context, userID, modelID string, inputTokens int) (bool, error)
	List(w http.ResponseWriter, r *http.Request)
}

// ApiKeyService определяет методы работы с API ключами
type ApiKeyService interface {
	CreateApiKey(ctx context.Context, userID string, name string, expiresAt *time.Time) (*domain.ApiKey, string, error) // Возвращает ключ API
	GetApiKey(ctx context.Context, id string) (*domain.ApiKey, error)
	ListApiKeys(ctx context.Context, userID string) ([]domain.ApiKey, error)
	DeleteApiKey(ctx context.Context, id string) error
}

// RequestService определяет методы работы с запросами пользователей
type RequestService interface {
	CreateRequest(ctx context.Context, userID string, modelID string, inputTokens, outputTokens int) (*domain.Request, error)
	GetRequest(ctx context.Context, id string) (*domain.Request, error)
	ListUserRequests(ctx context.Context, userID string, offset, limit int) ([]domain.Request, int, error) // Третий параметр - total count
}

// ModelSyncService определяет методы синхронизации моделей с LiteLLM
type ModelSyncService interface {
	SyncModels(ctx context.Context) error
	SyncCompanies(ctx context.Context) error
}

// LLMProxyService определяет методы проксирования запросов к моделям
type LLMProxyService interface {
	ProxyRequest(ctx context.Context, userID, modelID string, content string) (*domain.Response, error)
}
