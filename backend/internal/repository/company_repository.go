package repository

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

type companyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) CompanyRepository {
	return &companyRepository{db: db}
}

func (r *companyRepository) Create(ctx context.Context, company *domain.Company) error {
	if err := r.db.WithContext(ctx).Create(company).Error; err != nil {
		return fmt.Errorf("failed to create company: %w", err)
	}
	return nil
}

func (r *companyRepository) GetByID(ctx context.Context, id string) (*domain.Company, error) {
	var company domain.Company
	if err := r.db.WithContext(ctx).First(&company, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get company by ID: %w", err)
	}
	return &company, nil
}

func (r *companyRepository) GetByExternalID(ctx context.Context, externalID string) (*domain.Company, error) {
	var company domain.Company
	if err := r.db.WithContext(ctx).First(&company, "external_id = ?", externalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get company by external ID: %w", err)
	}
	return &company, nil
}

func (r *companyRepository) Update(ctx context.Context, company *domain.Company) error {
	if err := r.db.WithContext(ctx).Save(company).Error; err != nil {
		return fmt.Errorf("failed to update company: %w", err)
	}
	return nil
}

func (r *companyRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Company{}, "id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete company: %w", err)
	}
	return nil
}

func (r *companyRepository) List(ctx context.Context, limit, offset int) ([]*domain.Company, error) {
	var companies []*domain.Company
	query := r.db.WithContext(ctx).
		Select("companies.*, COUNT(models.id) as models_count").
		Joins("LEFT JOIN models ON companies.id = models.company_id").
		Group("companies.id")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&companies).Error; err != nil {
		return nil, fmt.Errorf("failed to list companies: %w", err)
	}
	return companies, nil
}
