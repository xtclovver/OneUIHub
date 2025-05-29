package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type rateLimitRepository struct {
	db *gorm.DB
}

func NewRateLimitRepository(db *gorm.DB) RateLimitRepository {
	return &rateLimitRepository{db: db}
}

func (r *rateLimitRepository) Create(ctx context.Context, rateLimit *domain.RateLimit) error {
	if err := r.db.WithContext(ctx).Create(rateLimit).Error; err != nil {
		return fmt.Errorf("failed to create rate limit: %w", err)
	}
	return nil
}

func (r *rateLimitRepository) GetByID(ctx context.Context, id string) (*domain.RateLimit, error) {
	var rateLimit domain.RateLimit
	if err := r.db.WithContext(ctx).Preload("Model").Preload("Tier").First(&rateLimit, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get rate limit by ID: %w", err)
	}
	return &rateLimit, nil
}

func (r *rateLimitRepository) GetByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error) {
	var rateLimit domain.RateLimit
	if err := r.db.WithContext(ctx).Preload("Model").Preload("Tier").
		Where("model_id = ? AND tier_id = ?", modelID, tierID).First(&rateLimit).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get rate limit by model and tier: %w", err)
	}
	return &rateLimit, nil
}

func (r *rateLimitRepository) GetByModelID(ctx context.Context, modelID string) ([]*domain.RateLimit, error) {
	var rateLimits []*domain.RateLimit
	if err := r.db.WithContext(ctx).Preload("Model").Preload("Tier").
		Where("model_id = ?", modelID).Find(&rateLimits).Error; err != nil {
		return nil, fmt.Errorf("failed to get rate limits by model ID: %w", err)
	}
	return rateLimits, nil
}

func (r *rateLimitRepository) GetByTierID(ctx context.Context, tierID string) ([]*domain.RateLimit, error) {
	var rateLimits []*domain.RateLimit
	if err := r.db.WithContext(ctx).Preload("Model").Preload("Tier").
		Where("tier_id = ?", tierID).Find(&rateLimits).Error; err != nil {
		return nil, fmt.Errorf("failed to get rate limits by tier ID: %w", err)
	}
	return rateLimits, nil
}

func (r *rateLimitRepository) Update(ctx context.Context, rateLimit *domain.RateLimit) error {
	if err := r.db.WithContext(ctx).Save(rateLimit).Error; err != nil {
		return fmt.Errorf("failed to update rate limit: %w", err)
	}
	return nil
}

func (r *rateLimitRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.RateLimit{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete rate limit: %w", err)
	}
	return nil
}

func (r *rateLimitRepository) List(ctx context.Context) ([]*domain.RateLimit, error) {
	var rateLimits []*domain.RateLimit
	if err := r.db.WithContext(ctx).Preload("Model").Preload("Tier").Find(&rateLimits).Error; err != nil {
		return nil, fmt.Errorf("failed to list rate limits: %w", err)
	}
	return rateLimits, nil
}
