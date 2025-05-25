package repository

import (
	"context"

	"oneui-hub/internal/domain"

	"gorm.io/gorm"
)

type currencyRepository struct {
	db *gorm.DB
}

func NewCurrencyRepository(db *gorm.DB) CurrencyRepository {
	return &currencyRepository{db: db}
}

func (r *currencyRepository) Create(ctx context.Context, currency *domain.Currency) error {
	return r.db.WithContext(ctx).Create(currency).Error
}

func (r *currencyRepository) GetByID(ctx context.Context, id string) (*domain.Currency, error) {
	var currency domain.Currency
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&currency).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &currency, nil
}

func (r *currencyRepository) GetAll(ctx context.Context) ([]domain.Currency, error) {
	var currencies []domain.Currency
	if err := r.db.WithContext(ctx).Find(&currencies).Error; err != nil {
		return nil, err
	}
	return currencies, nil
}

func (r *currencyRepository) Update(ctx context.Context, currency *domain.Currency) error {
	return r.db.WithContext(ctx).Save(currency).Error
}

func (r *currencyRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&domain.Currency{}, "id = ?", id).Error
}
