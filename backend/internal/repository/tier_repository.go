package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"backend/internal/domain"
)

type tierRepository struct {
	db *gorm.DB
}

func NewTierRepository(db *gorm.DB) TierRepository {
	return &tierRepository{db: db}
}

func (r *tierRepository) Create(ctx context.Context, tier *domain.Tier) error {
	if err := r.db.WithContext(ctx).Create(tier).Error; err != nil {
		return fmt.Errorf("failed to create tier: %w", err)
	}
	return nil
}

func (r *tierRepository) GetByID(ctx context.Context, id string) (*domain.Tier, error) {
	var tier domain.Tier
	if err := r.db.WithContext(ctx).First(&tier, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("tier not found")
		}
		return nil, fmt.Errorf("failed to get tier by ID: %w", err)
	}
	return &tier, nil
}

func (r *tierRepository) GetByName(ctx context.Context, name string) (*domain.Tier, error) {
	var tier domain.Tier
	if err := r.db.WithContext(ctx).First(&tier, "name = ?", name).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("tier not found")
		}
		return nil, fmt.Errorf("failed to get tier by name: %w", err)
	}
	return &tier, nil
}

func (r *tierRepository) Update(ctx context.Context, tier *domain.Tier) error {
	if err := r.db.WithContext(ctx).Save(tier).Error; err != nil {
		return fmt.Errorf("failed to update tier: %w", err)
	}
	return nil
}

func (r *tierRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Tier{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete tier: %w", err)
	}
	return nil
}

func (r *tierRepository) List(ctx context.Context) ([]*domain.Tier, error) {
	var tiers []*domain.Tier
	if err := r.db.WithContext(ctx).Find(&tiers).Error; err != nil {
		return nil, fmt.Errorf("failed to list tiers: %w", err)
	}
	return tiers, nil
}

func (r *tierRepository) GetAll(ctx context.Context) ([]domain.Tier, error) {
	var tiers []domain.Tier
	if err := r.db.WithContext(ctx).Find(&tiers).Error; err != nil {
		return nil, fmt.Errorf("failed to get all tiers: %w", err)
	}
	return tiers, nil
}

func (r *tierRepository) GetAllOrderedByPrice(ctx context.Context) ([]domain.Tier, error) {
	var tiers []domain.Tier
	if err := r.db.WithContext(ctx).Order("price ASC").Find(&tiers).Error; err != nil {
		return nil, fmt.Errorf("failed to get tiers ordered by price: %w", err)
	}
	return tiers, nil
}
