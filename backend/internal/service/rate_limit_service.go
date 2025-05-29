package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/repository"
)

type RateLimitService interface {
	CreateRateLimit(ctx context.Context, req *CreateRateLimitRequest) (*domain.RateLimit, error)
	GetRateLimitByID(ctx context.Context, id string) (*domain.RateLimit, error)
	GetRateLimitByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error)
	GetRateLimitsByModelID(ctx context.Context, modelID string) ([]*domain.RateLimit, error)
	GetRateLimitsByTierID(ctx context.Context, tierID string) ([]*domain.RateLimit, error)
	UpdateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error
	DeleteRateLimit(ctx context.Context, id string) error
	GetAllRateLimits(ctx context.Context) ([]*domain.RateLimit, error)
}

type rateLimitService struct {
	rateLimitRepo repository.RateLimitRepository
	modelRepo     repository.ModelRepository
	tierRepo      repository.TierRepository
}

func NewRateLimitService(
	rateLimitRepo repository.RateLimitRepository,
	modelRepo repository.ModelRepository,
	tierRepo repository.TierRepository,
) RateLimitService {
	return &rateLimitService{
		rateLimitRepo: rateLimitRepo,
		modelRepo:     modelRepo,
		tierRepo:      tierRepo,
	}
}

type CreateRateLimitRequest struct {
	ModelID           string `json:"model_id" validate:"required"`
	TierID            string `json:"tier_id" validate:"required"`
	RequestsPerMinute int    `json:"requests_per_minute" validate:"min=0"`
	RequestsPerDay    int    `json:"requests_per_day" validate:"min=0"`
	TokensPerMinute   int    `json:"tokens_per_minute" validate:"min=0"`
	TokensPerDay      int    `json:"tokens_per_day" validate:"min=0"`
}

func (s *rateLimitService) CreateRateLimit(ctx context.Context, req *CreateRateLimitRequest) (*domain.RateLimit, error) {
	// Проверяем, что модель существует
	_, err := s.modelRepo.GetByID(ctx, req.ModelID)
	if err != nil {
		return nil, fmt.Errorf("model not found: %w", err)
	}

	// Проверяем, что тариф существует
	_, err = s.tierRepo.GetByID(ctx, req.TierID)
	if err != nil {
		return nil, fmt.Errorf("tier not found: %w", err)
	}

	// Проверяем, что лимит для этой модели и тарифа не существует
	existingLimit, err := s.rateLimitRepo.GetByModelAndTier(ctx, req.ModelID, req.TierID)
	if err == nil && existingLimit != nil {
		return nil, fmt.Errorf("rate limit for model %s and tier %s already exists", req.ModelID, req.TierID)
	}

	rateLimit := &domain.RateLimit{
		ID:                uuid.New().String(),
		ModelID:           req.ModelID,
		TierID:            req.TierID,
		RequestsPerMinute: req.RequestsPerMinute,
		RequestsPerDay:    req.RequestsPerDay,
		TokensPerMinute:   req.TokensPerMinute,
		TokensPerDay:      req.TokensPerDay,
	}

	if err := s.rateLimitRepo.Create(ctx, rateLimit); err != nil {
		return nil, fmt.Errorf("failed to create rate limit: %w", err)
	}

	return s.rateLimitRepo.GetByID(ctx, rateLimit.ID)
}

func (s *rateLimitService) GetRateLimitByID(ctx context.Context, id string) (*domain.RateLimit, error) {
	return s.rateLimitRepo.GetByID(ctx, id)
}

func (s *rateLimitService) GetRateLimitByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error) {
	return s.rateLimitRepo.GetByModelAndTier(ctx, modelID, tierID)
}

func (s *rateLimitService) GetRateLimitsByModelID(ctx context.Context, modelID string) ([]*domain.RateLimit, error) {
	return s.rateLimitRepo.GetByModelID(ctx, modelID)
}

func (s *rateLimitService) GetRateLimitsByTierID(ctx context.Context, tierID string) ([]*domain.RateLimit, error) {
	return s.rateLimitRepo.GetByTierID(ctx, tierID)
}

func (s *rateLimitService) UpdateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error {
	// Проверяем, что лимит существует
	_, err := s.rateLimitRepo.GetByID(ctx, rateLimit.ID)
	if err != nil {
		return fmt.Errorf("rate limit not found: %w", err)
	}

	return s.rateLimitRepo.Update(ctx, rateLimit)
}

func (s *rateLimitService) DeleteRateLimit(ctx context.Context, id string) error {
	// Проверяем, что лимит существует
	_, err := s.rateLimitRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("rate limit not found: %w", err)
	}

	return s.rateLimitRepo.Delete(ctx, id)
}

func (s *rateLimitService) GetAllRateLimits(ctx context.Context) ([]*domain.RateLimit, error) {
	return s.rateLimitRepo.List(ctx)
}
