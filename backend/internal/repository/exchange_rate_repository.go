package repository

import (
	"context"

	"backend/internal/domain"

	"gorm.io/gorm"
)

type exchangeRateRepository struct {
	db *gorm.DB
}

func NewExchangeRateRepository(db *gorm.DB) ExchangeRateRepository {
	return &exchangeRateRepository{db: db}
}

func (r *exchangeRateRepository) Create(ctx context.Context, rate *domain.ExchangeRate) error {
	return r.db.WithContext(ctx).Create(rate).Error
}

func (r *exchangeRateRepository) GetByID(ctx context.Context, id string) (*domain.ExchangeRate, error) {
	var rate domain.ExchangeRate
	if err := r.db.WithContext(ctx).Preload("From").Preload("To").Where("id = ?", id).First(&rate).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &rate, nil
}

func (r *exchangeRateRepository) GetRate(ctx context.Context, fromCurrency, toCurrency string) (*domain.ExchangeRate, error) {
	var rate domain.ExchangeRate
	if err := r.db.WithContext(ctx).
		Preload("From").
		Preload("To").
		Where("from_currency = ? AND to_currency = ?", fromCurrency, toCurrency).
		First(&rate).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &rate, nil
}

func (r *exchangeRateRepository) Update(ctx context.Context, rate *domain.ExchangeRate) error {
	return r.db.WithContext(ctx).Save(rate).Error
}

func (r *exchangeRateRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&domain.ExchangeRate{}, "id = ?", id).Error
}

func (r *exchangeRateRepository) GetAll(ctx context.Context) ([]*domain.ExchangeRate, error) {
	var rates []*domain.ExchangeRate
	if err := r.db.WithContext(ctx).Preload("From").Preload("To").Find(&rates).Error; err != nil {
		return nil, err
	}
	return rates, nil
}
