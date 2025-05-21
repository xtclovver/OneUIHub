package mysql

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
)

type modelConfigRepository struct {
	db *sql.DB
}

// NewModelConfigRepository создает новый репозиторий конфигураций моделей
func NewModelConfigRepository(db *sql.DB) *modelConfigRepository {
	return &modelConfigRepository{
		db: db,
	}
}

// Create создает новую конфигурацию модели
func (r *modelConfigRepository) Create(ctx context.Context, config *domain.ModelConfig) error {
	if config.ID == "" {
		config.ID = uuid.New().String()
	}

	now := time.Now()
	config.CreatedAt = now
	config.UpdatedAt = now

	query := `
		INSERT INTO model_configs (id, model_id, is_free, is_enabled, input_token_cost, output_token_cost, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		config.ID,
		config.ModelID,
		config.IsFree,
		config.IsEnabled,
		config.InputTokenCost,
		config.OutputTokenCost,
		config.CreatedAt,
		config.UpdatedAt,
	)

	return err
}

// FindByID находит конфигурацию модели по ID
func (r *modelConfigRepository) FindByID(ctx context.Context, id string) (*domain.ModelConfig, error) {
	query := `
		SELECT id, model_id, is_free, is_enabled, input_token_cost, output_token_cost, created_at, updated_at
		FROM model_configs
		WHERE id = ?
	`

	var config domain.ModelConfig
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&config.ID,
		&config.ModelID,
		&config.IsFree,
		&config.IsEnabled,
		&config.InputTokenCost,
		&config.OutputTokenCost,
		&config.CreatedAt,
		&config.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("конфигурация модели не найдена")
		}
		return nil, err
	}

	return &config, nil
}

// FindByModelID находит конфигурацию модели по model ID
func (r *modelConfigRepository) FindByModelID(ctx context.Context, modelID string) (*domain.ModelConfig, error) {
	query := `
		SELECT id, model_id, is_free, is_enabled, input_token_cost, output_token_cost, created_at, updated_at
		FROM model_configs
		WHERE model_id = ?
	`

	var config domain.ModelConfig
	err := r.db.QueryRowContext(ctx, query, modelID).Scan(
		&config.ID,
		&config.ModelID,
		&config.IsFree,
		&config.IsEnabled,
		&config.InputTokenCost,
		&config.OutputTokenCost,
		&config.CreatedAt,
		&config.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("конфигурация модели не найдена")
		}
		return nil, err
	}

	return &config, nil
}

// Update обновляет конфигурацию модели
func (r *modelConfigRepository) Update(ctx context.Context, config *domain.ModelConfig) error {
	config.UpdatedAt = time.Now()

	query := `
		UPDATE model_configs
		SET model_id = ?, is_free = ?, is_enabled = ?, input_token_cost = ?, output_token_cost = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		config.ModelID,
		config.IsFree,
		config.IsEnabled,
		config.InputTokenCost,
		config.OutputTokenCost,
		config.UpdatedAt,
		config.ID,
	)

	return err
}

// Delete удаляет конфигурацию модели
func (r *modelConfigRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM model_configs WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список конфигураций моделей
func (r *modelConfigRepository) List(ctx context.Context) ([]domain.ModelConfig, error) {
	query := `
		SELECT id, model_id, is_free, is_enabled, input_token_cost, output_token_cost, created_at, updated_at
		FROM model_configs
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []domain.ModelConfig
	for rows.Next() {
		var config domain.ModelConfig
		if err := rows.Scan(
			&config.ID,
			&config.ModelID,
			&config.IsFree,
			&config.IsEnabled,
			&config.InputTokenCost,
			&config.OutputTokenCost,
			&config.CreatedAt,
			&config.UpdatedAt,
		); err != nil {
			return nil, err
		}
		configs = append(configs, config)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return configs, nil
}
