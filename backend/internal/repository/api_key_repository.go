package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type apiKeyRepository struct {
	db *gorm.DB
}

func NewApiKeyRepository(db *gorm.DB) ApiKeyRepository {
	return &apiKeyRepository{db: db}
}

func (r *apiKeyRepository) Create(ctx context.Context, apiKey *domain.ApiKey) error {
	if err := r.db.WithContext(ctx).Create(apiKey).Error; err != nil {
		return fmt.Errorf("failed to create API key: %w", err)
	}
	return nil
}

func (r *apiKeyRepository) GetByID(ctx context.Context, id string) (*domain.ApiKey, error) {
	var apiKey domain.ApiKey
	if err := r.db.WithContext(ctx).Preload("User").First(&apiKey, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get API key by ID: %w", err)
	}
	return &apiKey, nil
}

func (r *apiKeyRepository) GetByUserID(ctx context.Context, userID string) ([]*domain.ApiKey, error) {
	var apiKeys []*domain.ApiKey
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&apiKeys).Error; err != nil {
		return nil, fmt.Errorf("failed to get API keys by user ID: %w", err)
	}
	return apiKeys, nil
}

func (r *apiKeyRepository) GetByKeyHash(ctx context.Context, keyHash string) (*domain.ApiKey, error) {
	var apiKey domain.ApiKey
	if err := r.db.WithContext(ctx).Preload("User").First(&apiKey, "key_hash = ?", keyHash).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get API key by hash: %w", err)
	}
	return &apiKey, nil
}

func (r *apiKeyRepository) Update(ctx context.Context, apiKey *domain.ApiKey) error {
	if err := r.db.WithContext(ctx).Save(apiKey).Error; err != nil {
		return fmt.Errorf("failed to update API key: %w", err)
	}
	return nil
}

func (r *apiKeyRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.ApiKey{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete API key: %w", err)
	}
	return nil
}
