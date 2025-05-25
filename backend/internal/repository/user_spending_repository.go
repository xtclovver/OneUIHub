package repository

import (
	"context"

	"oneui-hub/internal/domain"

	"gorm.io/gorm"
)

type userSpendingRepository struct {
	db *gorm.DB
}

func NewUserSpendingRepository(db *gorm.DB) UserSpendingRepository {
	return &userSpendingRepository{db: db}
}

func (r *userSpendingRepository) Create(ctx context.Context, spending *domain.UserSpending) error {
	return r.db.WithContext(ctx).Create(spending).Error
}

func (r *userSpendingRepository) GetByUserID(ctx context.Context, userID string) (*domain.UserSpending, error) {
	var spending domain.UserSpending
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&spending).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &spending, nil
}

func (r *userSpendingRepository) Update(ctx context.Context, spending *domain.UserSpending) error {
	return r.db.WithContext(ctx).Save(spending).Error
}

func (r *userSpendingRepository) Delete(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Delete(&domain.UserSpending{}, "user_id = ?", userID).Error
}
