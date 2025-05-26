package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"oneui-hub/internal/domain"

	"github.com/jmoiron/sqlx"
)

type SettingRepository interface {
	GetAll(ctx context.Context) ([]*domain.Setting, error)
	GetByKey(ctx context.Context, key string) (*domain.Setting, error)
	GetByCategory(ctx context.Context, category string) ([]*domain.Setting, error)
	Create(ctx context.Context, setting *domain.Setting) error
	Update(ctx context.Context, setting *domain.Setting) error
	Delete(ctx context.Context, id string) error
	UpdateByKey(ctx context.Context, key, value string) error
}

type settingRepository struct {
	db *sqlx.DB
}

func NewSettingRepository(db *sqlx.DB) SettingRepository {
	return &settingRepository{db: db}
}

func (r *settingRepository) GetAll(ctx context.Context) ([]*domain.Setting, error) {
	query := `
		SELECT id, key, value, description, type, category, created_at, updated_at
		FROM settings
		ORDER BY category, key
	`

	var settings []*domain.Setting
	if err := r.db.SelectContext(ctx, &settings, query); err != nil {
		return nil, fmt.Errorf("failed to get all settings: %w", err)
	}

	return settings, nil
}

func (r *settingRepository) GetByKey(ctx context.Context, key string) (*domain.Setting, error) {
	query := `
		SELECT id, key, value, description, type, category, created_at, updated_at
		FROM settings
		WHERE key = $1
	`

	var setting domain.Setting
	if err := r.db.GetContext(ctx, &setting, query, key); err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get setting by key: %w", err)
	}

	return &setting, nil
}

func (r *settingRepository) GetByCategory(ctx context.Context, category string) ([]*domain.Setting, error) {
	query := `
		SELECT id, key, value, description, type, category, created_at, updated_at
		FROM settings
		WHERE category = $1
		ORDER BY key
	`

	var settings []*domain.Setting
	if err := r.db.SelectContext(ctx, &settings, query, category); err != nil {
		return nil, fmt.Errorf("failed to get settings by category: %w", err)
	}

	return settings, nil
}

func (r *settingRepository) Create(ctx context.Context, setting *domain.Setting) error {
	query := `
		INSERT INTO settings (id, key, value, description, type, category, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	now := time.Now()
	setting.CreatedAt = now
	setting.UpdatedAt = now

	_, err := r.db.ExecContext(ctx, query,
		setting.ID,
		setting.Key,
		setting.Value,
		setting.Description,
		setting.Type,
		setting.Category,
		setting.CreatedAt,
		setting.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create setting: %w", err)
	}

	return nil
}

func (r *settingRepository) Update(ctx context.Context, setting *domain.Setting) error {
	query := `
		UPDATE settings
		SET value = $2, description = $3, type = $4, category = $5, updated_at = $6
		WHERE id = $1
	`

	setting.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query,
		setting.ID,
		setting.Value,
		setting.Description,
		setting.Type,
		setting.Category,
		setting.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update setting: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *settingRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM settings WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete setting: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *settingRepository) UpdateByKey(ctx context.Context, key, value string) error {
	query := `
		UPDATE settings
		SET value = $2, updated_at = $3
		WHERE key = $1
	`

	result, err := r.db.ExecContext(ctx, query, key, value, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update setting by key: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}
