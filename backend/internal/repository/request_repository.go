package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type requestRepository struct {
	db *gorm.DB
}

func NewRequestRepository(db *gorm.DB) RequestRepository {
	return &requestRepository{db: db}
}

func (r *requestRepository) Create(ctx context.Context, request *domain.Request) error {
	if err := r.db.WithContext(ctx).Create(request).Error; err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	return nil
}

func (r *requestRepository) GetByID(ctx context.Context, id string) (*domain.Request, error) {
	var request domain.Request
	if err := r.db.WithContext(ctx).Preload("User").Preload("Model").First(&request, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get request by ID: %w", err)
	}
	return &request, nil
}

func (r *requestRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Request, error) {
	var requests []*domain.Request
	query := r.db.WithContext(ctx).Where("user_id = ?", userID).Preload("Model").Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&requests).Error; err != nil {
		return nil, fmt.Errorf("failed to get requests by user ID: %w", err)
	}
	return requests, nil
}

func (r *requestRepository) GetByModelID(ctx context.Context, modelID string, limit, offset int) ([]*domain.Request, error) {
	var requests []*domain.Request
	query := r.db.WithContext(ctx).Where("model_id = ?", modelID).Preload("User").Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&requests).Error; err != nil {
		return nil, fmt.Errorf("failed to get requests by model ID: %w", err)
	}
	return requests, nil
}

func (r *requestRepository) List(ctx context.Context, limit, offset int) ([]*domain.Request, error) {
	var requests []*domain.Request
	query := r.db.WithContext(ctx).Preload("User").Preload("Model").Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&requests).Error; err != nil {
		return nil, fmt.Errorf("failed to list requests: %w", err)
	}
	return requests, nil
}
