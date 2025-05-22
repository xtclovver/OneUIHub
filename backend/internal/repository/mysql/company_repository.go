package mysql

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/oneaihub/backend/internal/domain"
)

type companyRepository struct {
	db *sqlx.DB
}

// NewCompanyRepository создает новый репозиторий компаний
func NewCompanyRepository(db *sqlx.DB) *companyRepository {
	return &companyRepository{
		db: db,
	}
}

// Create создает новую компанию
func (r *companyRepository) Create(ctx context.Context, company *domain.Company) error {
	if company.ID == "" {
		company.ID = uuid.New().String()
	}

	now := time.Now()
	company.CreatedAt = now
	company.UpdatedAt = now

	query := `
		INSERT INTO companies (id, name, logo_url, description, external_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		company.ID,
		company.Name,
		company.LogoURL,
		company.Description,
		company.ExternalID,
		company.CreatedAt,
		company.UpdatedAt,
	)

	return err
}

// FindByID находит компанию по ID
func (r *companyRepository) FindByID(ctx context.Context, id string) (*domain.Company, error) {
	query := `
		SELECT id, name, logo_url, description, external_id, created_at, updated_at
		FROM companies
		WHERE id = ?
	`

	var company domain.Company
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&company.ID,
		&company.Name,
		&company.LogoURL,
		&company.Description,
		&company.ExternalID,
		&company.CreatedAt,
		&company.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("компания не найдена")
		}
		return nil, err
	}

	return &company, nil
}

// FindByExternalID находит компанию по external ID
func (r *companyRepository) FindByExternalID(ctx context.Context, externalID string) (*domain.Company, error) {
	query := `
		SELECT id, name, logo_url, description, external_id, created_at, updated_at
		FROM companies
		WHERE external_id = ?
	`

	var company domain.Company
	err := r.db.QueryRowContext(ctx, query, externalID).Scan(
		&company.ID,
		&company.Name,
		&company.LogoURL,
		&company.Description,
		&company.ExternalID,
		&company.CreatedAt,
		&company.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &company, nil
}

// Update обновляет данные компании
func (r *companyRepository) Update(ctx context.Context, company *domain.Company) error {
	company.UpdatedAt = time.Now()

	query := `
		UPDATE companies
		SET name = ?, logo_url = ?, description = ?, external_id = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		company.Name,
		company.LogoURL,
		company.Description,
		company.ExternalID,
		company.UpdatedAt,
		company.ID,
	)

	return err
}

// Delete удаляет компанию
func (r *companyRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM companies WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список компаний
func (r *companyRepository) List(ctx context.Context) ([]domain.Company, error) {
	query := `
		SELECT id, name, logo_url, description, external_id, created_at, updated_at
		FROM companies
		ORDER BY name ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var companies []domain.Company
	for rows.Next() {
		var company domain.Company
		if err := rows.Scan(
			&company.ID,
			&company.Name,
			&company.LogoURL,
			&company.Description,
			&company.ExternalID,
			&company.CreatedAt,
			&company.UpdatedAt,
		); err != nil {
			return nil, err
		}
		companies = append(companies, company)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return companies, nil
}

// FindByName находит компанию по имени
func (r *companyRepository) FindByName(ctx context.Context, name string) (*domain.Company, error) {
	query := `
		SELECT id, name, logo_url, description, external_id, created_at, updated_at
		FROM companies
		WHERE name = ?
	`

	var company domain.Company
	err := r.db.QueryRowContext(ctx, query, name).Scan(
		&company.ID,
		&company.Name,
		&company.LogoURL,
		&company.Description,
		&company.ExternalID,
		&company.CreatedAt,
		&company.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Возвращаем nil, nil если компания не найдена
		}
		return nil, err
	}

	return &company, nil
}
