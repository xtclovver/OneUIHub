package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type userLimitRepository struct {
	db *gorm.DB
}

func NewUserLimitRepository(db *gorm.DB) UserLimitRepository {
	return &userLimitRepository{db: db}
}

func (r *userLimitRepository) Create(ctx context.Context, userLimit *domain.UserLimit) error {
	if err := r.db.WithContext(ctx).Create(userLimit).Error; err != nil {
		return fmt.Errorf("failed to create user limit: %w", err)
	}
	return nil
}

func (r *userLimitRepository) GetByUserID(ctx context.Context, userID string) (*domain.UserLimit, error) {
	var userLimit domain.UserLimit
	if err := r.db.WithContext(ctx).First(&userLimit, "user_id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user limit not found")
		}
		return nil, fmt.Errorf("failed to get user limit: %w", err)
	}
	return &userLimit, nil
}

func (r *userLimitRepository) Update(ctx context.Context, userLimit *domain.UserLimit) error {
	if err := r.db.WithContext(ctx).Save(userLimit).Error; err != nil {
		return fmt.Errorf("failed to update user limit: %w", err)
	}
	return nil
}

func (r *userLimitRepository) Delete(ctx context.Context, userID string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.UserLimit{}, "user_id = ?", userID).Error; err != nil {
		return fmt.Errorf("failed to delete user limit: %w", err)
	}
	return nil
}
