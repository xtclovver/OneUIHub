package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type modelConfigRepository struct {
	db *gorm.DB
}

func NewModelConfigRepository(db *gorm.DB) ModelConfigRepository {
	return &modelConfigRepository{db: db}
}

func (r *modelConfigRepository) Create(ctx context.Context, config *domain.ModelConfig) error {
	if err := r.db.WithContext(ctx).Create(config).Error; err != nil {
		return fmt.Errorf("failed to create model config: %w", err)
	}
	return nil
}

func (r *modelConfigRepository) GetByID(ctx context.Context, id string) (*domain.ModelConfig, error) {
	var config domain.ModelConfig
	if err := r.db.WithContext(ctx).First(&config, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get model config by ID: %w", err)
	}
	return &config, nil
}

func (r *modelConfigRepository) GetByModelID(ctx context.Context, modelID string) (*domain.ModelConfig, error) {
	var config domain.ModelConfig
	if err := r.db.WithContext(ctx).First(&config, "model_id = ?", modelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get model config by model ID: %w", err)
	}
	return &config, nil
}

func (r *modelConfigRepository) Update(ctx context.Context, config *domain.ModelConfig) error {
	if err := r.db.WithContext(ctx).Save(config).Error; err != nil {
		return fmt.Errorf("failed to update model config: %w", err)
	}
	return nil
}

func (r *modelConfigRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.ModelConfig{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete model config: %w", err)
	}
	return nil
}
