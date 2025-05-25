package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type modelRepository struct {
	db *gorm.DB
}

func NewModelRepository(db *gorm.DB) ModelRepository {
	return &modelRepository{db: db}
}

func (r *modelRepository) Create(ctx context.Context, model *domain.Model) error {
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create model: %w", err)
	}
	return nil
}

func (r *modelRepository) GetByID(ctx context.Context, id string) (*domain.Model, error) {
	var model domain.Model
	if err := r.db.WithContext(ctx).Preload("Company").Preload("ModelConfig").First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get model by ID: %w", err)
	}
	return &model, nil
}

func (r *modelRepository) GetByExternalID(ctx context.Context, externalID string) (*domain.Model, error) {
	var model domain.Model
	if err := r.db.WithContext(ctx).Preload("Company").Preload("ModelConfig").First(&model, "external_id = ?", externalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get model by external ID: %w", err)
	}
	return &model, nil
}

func (r *modelRepository) GetByCompanyID(ctx context.Context, companyID string, limit, offset int) ([]*domain.Model, error) {
	var models []*domain.Model
	query := r.db.WithContext(ctx).Preload("Company").Preload("ModelConfig").Where("company_id = ?", companyID)

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get models by company ID: %w", err)
	}
	return models, nil
}

func (r *modelRepository) Update(ctx context.Context, model *domain.Model) error {
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update model: %w", err)
	}
	return nil
}

func (r *modelRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Model{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}
	return nil
}

func (r *modelRepository) List(ctx context.Context, limit, offset int) ([]*domain.Model, error) {
	var models []*domain.Model
	query := r.db.WithContext(ctx).Preload("Company").Preload("ModelConfig")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to list models: %w", err)
	}
	return models, nil
}
