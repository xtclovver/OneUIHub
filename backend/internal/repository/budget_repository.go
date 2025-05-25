package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type budgetRepository struct {
	db *gorm.DB
}

func NewBudgetRepository(db *gorm.DB) BudgetRepository {
	return &budgetRepository{db: db}
}

func (r *budgetRepository) Create(ctx context.Context, budget *domain.Budget) error {
	if err := r.db.WithContext(ctx).Create(budget).Error; err != nil {
		return fmt.Errorf("failed to create budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) GetByID(ctx context.Context, id string) (*domain.Budget, error) {
	var budget domain.Budget
	if err := r.db.WithContext(ctx).Preload("User").First(&budget, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get budget by ID: %w", err)
	}
	return &budget, nil
}

func (r *budgetRepository) GetByExternalID(ctx context.Context, externalID string) (*domain.Budget, error) {
	var budget domain.Budget
	if err := r.db.WithContext(ctx).Preload("User").First(&budget, "external_id = ?", externalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get budget by external ID: %w", err)
	}
	return &budget, nil
}

func (r *budgetRepository) GetByUserID(ctx context.Context, userID string) ([]*domain.Budget, error) {
	var budgets []*domain.Budget
	if err := r.db.WithContext(ctx).Preload("User").Where("user_id = ?", userID).Find(&budgets).Error; err != nil {
		return nil, fmt.Errorf("failed to get budgets by user ID: %w", err)
	}
	return budgets, nil
}

func (r *budgetRepository) Update(ctx context.Context, budget *domain.Budget) error {
	if err := r.db.WithContext(ctx).Save(budget).Error; err != nil {
		return fmt.Errorf("failed to update budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Budget{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) List(ctx context.Context, limit, offset int) ([]*domain.Budget, error) {
	var budgets []*domain.Budget
	query := r.db.WithContext(ctx).Preload("User")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&budgets).Error; err != nil {
		return nil, fmt.Errorf("failed to list budgets: %w", err)
	}
	return budgets, nil
}
