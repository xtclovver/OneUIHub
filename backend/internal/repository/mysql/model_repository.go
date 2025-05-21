package mysql

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
)

type modelRepository struct {
	db *sql.DB
}

// NewModelRepository создает новый репозиторий моделей
func NewModelRepository(db *sql.DB) *modelRepository {
	return &modelRepository{
		db: db,
	}
}

// Create создает новую модель
func (r *modelRepository) Create(ctx context.Context, model *domain.Model) error {
	if model.ID == "" {
		model.ID = uuid.New().String()
	}

	now := time.Now()
	model.CreatedAt = now
	model.UpdatedAt = now

	query := `
		INSERT INTO models (id, company_id, name, description, features, external_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		model.ID,
		model.CompanyID,
		model.Name,
		model.Description,
		model.Features,
		model.ExternalID,
		model.CreatedAt,
		model.UpdatedAt,
	)

	return err
}

// FindByID находит модель по ID
func (r *modelRepository) FindByID(ctx context.Context, id string) (*domain.Model, error) {
	query := `
		SELECT id, company_id, name, description, features, external_id, created_at, updated_at
		FROM models
		WHERE id = ?
	`

	var model domain.Model
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&model.ID,
		&model.CompanyID,
		&model.Name,
		&model.Description,
		&model.Features,
		&model.ExternalID,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("модель не найдена")
		}
		return nil, err
	}

	return &model, nil
}

// FindByExternalID находит модель по external ID
func (r *modelRepository) FindByExternalID(ctx context.Context, externalID string) (*domain.Model, error) {
	query := `
		SELECT id, company_id, name, description, features, external_id, created_at, updated_at
		FROM models
		WHERE external_id = ?
	`

	var model domain.Model
	err := r.db.QueryRowContext(ctx, query, externalID).Scan(
		&model.ID,
		&model.CompanyID,
		&model.Name,
		&model.Description,
		&model.Features,
		&model.ExternalID,
		&model.CreatedAt,
		&model.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &model, nil
}

// Update обновляет данные модели
func (r *modelRepository) Update(ctx context.Context, model *domain.Model) error {
	model.UpdatedAt = time.Now()

	query := `
		UPDATE models
		SET company_id = ?, name = ?, description = ?, features = ?, external_id = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		model.CompanyID,
		model.Name,
		model.Description,
		model.Features,
		model.ExternalID,
		model.UpdatedAt,
		model.ID,
	)

	return err
}

// Delete удаляет модель
func (r *modelRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM models WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список моделей
func (r *modelRepository) List(ctx context.Context) ([]domain.Model, error) {
	query := `
		SELECT id, company_id, name, description, features, external_id, created_at, updated_at
		FROM models
		ORDER BY name ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var models []domain.Model
	for rows.Next() {
		var model domain.Model
		if err := rows.Scan(
			&model.ID,
			&model.CompanyID,
			&model.Name,
			&model.Description,
			&model.Features,
			&model.ExternalID,
			&model.CreatedAt,
			&model.UpdatedAt,
		); err != nil {
			return nil, err
		}
		models = append(models, model)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return models, nil
}

// ListByCompanyID возвращает список моделей компании
func (r *modelRepository) ListByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error) {
	query := `
		SELECT id, company_id, name, description, features, external_id, created_at, updated_at
		FROM models
		WHERE company_id = ?
		ORDER BY name ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var models []domain.Model
	for rows.Next() {
		var model domain.Model
		if err := rows.Scan(
			&model.ID,
			&model.CompanyID,
			&model.Name,
			&model.Description,
			&model.Features,
			&model.ExternalID,
			&model.CreatedAt,
			&model.UpdatedAt,
		); err != nil {
			return nil, err
		}
		models = append(models, model)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return models, nil
}
