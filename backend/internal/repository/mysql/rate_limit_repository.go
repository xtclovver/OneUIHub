package mysql

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
)

type rateLimitRepository struct {
	db *sql.DB
}

// NewRateLimitRepository создает новый репозиторий ограничений запросов
func NewRateLimitRepository(db *sql.DB) *rateLimitRepository {
	return &rateLimitRepository{
		db: db,
	}
}

// Create создает новое ограничение запросов
func (r *rateLimitRepository) Create(ctx context.Context, rateLimit *domain.RateLimit) error {
	if rateLimit.ID == "" {
		rateLimit.ID = uuid.New().String()
	}

	now := time.Now()
	rateLimit.CreatedAt = now
	rateLimit.UpdatedAt = now

	query := `
		INSERT INTO rate_limits (id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		rateLimit.ID,
		rateLimit.ModelID,
		rateLimit.TierID,
		rateLimit.RequestsPerMinute,
		rateLimit.RequestsPerDay,
		rateLimit.TokensPerMinute,
		rateLimit.TokensPerDay,
		rateLimit.CreatedAt,
		rateLimit.UpdatedAt,
	)

	return err
}

// FindByID находит ограничение запросов по ID
func (r *rateLimitRepository) FindByID(ctx context.Context, id string) (*domain.RateLimit, error) {
	query := `
		SELECT id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at
		FROM rate_limits
		WHERE id = ?
	`

	var rateLimit domain.RateLimit
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&rateLimit.ID,
		&rateLimit.ModelID,
		&rateLimit.TierID,
		&rateLimit.RequestsPerMinute,
		&rateLimit.RequestsPerDay,
		&rateLimit.TokensPerMinute,
		&rateLimit.TokensPerDay,
		&rateLimit.CreatedAt,
		&rateLimit.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("ограничение запросов не найдено")
		}
		return nil, err
	}

	return &rateLimit, nil
}

// FindByModelAndTier находит ограничение запросов по модели и тиру
func (r *rateLimitRepository) FindByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error) {
	query := `
		SELECT id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at
		FROM rate_limits
		WHERE model_id = ? AND tier_id = ?
	`

	var rateLimit domain.RateLimit
	err := r.db.QueryRowContext(ctx, query, modelID, tierID).Scan(
		&rateLimit.ID,
		&rateLimit.ModelID,
		&rateLimit.TierID,
		&rateLimit.RequestsPerMinute,
		&rateLimit.RequestsPerDay,
		&rateLimit.TokensPerMinute,
		&rateLimit.TokensPerDay,
		&rateLimit.CreatedAt,
		&rateLimit.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("ограничение запросов не найдено")
		}
		return nil, err
	}

	return &rateLimit, nil
}

// Update обновляет ограничение запросов
func (r *rateLimitRepository) Update(ctx context.Context, rateLimit *domain.RateLimit) error {
	rateLimit.UpdatedAt = time.Now()

	query := `
		UPDATE rate_limits
		SET model_id = ?, tier_id = ?, requests_per_minute = ?, requests_per_day = ?, tokens_per_minute = ?, tokens_per_day = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		rateLimit.ModelID,
		rateLimit.TierID,
		rateLimit.RequestsPerMinute,
		rateLimit.RequestsPerDay,
		rateLimit.TokensPerMinute,
		rateLimit.TokensPerDay,
		rateLimit.UpdatedAt,
		rateLimit.ID,
	)

	return err
}

// Delete удаляет ограничение запросов
func (r *rateLimitRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM rate_limits WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список ограничений запросов
func (r *rateLimitRepository) List(ctx context.Context) ([]domain.RateLimit, error) {
	query := `
		SELECT id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at
		FROM rate_limits
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rateLimits []domain.RateLimit
	for rows.Next() {
		var rateLimit domain.RateLimit
		if err := rows.Scan(
			&rateLimit.ID,
			&rateLimit.ModelID,
			&rateLimit.TierID,
			&rateLimit.RequestsPerMinute,
			&rateLimit.RequestsPerDay,
			&rateLimit.TokensPerMinute,
			&rateLimit.TokensPerDay,
			&rateLimit.CreatedAt,
			&rateLimit.UpdatedAt,
		); err != nil {
			return nil, err
		}
		rateLimits = append(rateLimits, rateLimit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rateLimits, nil
}

// ListByModelID возвращает список ограничений запросов по модели
func (r *rateLimitRepository) ListByModelID(ctx context.Context, modelID string) ([]domain.RateLimit, error) {
	query := `
		SELECT id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at
		FROM rate_limits
		WHERE model_id = ?
	`

	rows, err := r.db.QueryContext(ctx, query, modelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rateLimits []domain.RateLimit
	for rows.Next() {
		var rateLimit domain.RateLimit
		if err := rows.Scan(
			&rateLimit.ID,
			&rateLimit.ModelID,
			&rateLimit.TierID,
			&rateLimit.RequestsPerMinute,
			&rateLimit.RequestsPerDay,
			&rateLimit.TokensPerMinute,
			&rateLimit.TokensPerDay,
			&rateLimit.CreatedAt,
			&rateLimit.UpdatedAt,
		); err != nil {
			return nil, err
		}
		rateLimits = append(rateLimits, rateLimit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rateLimits, nil
}

// ListByTierID возвращает список ограничений запросов по тиру
func (r *rateLimitRepository) ListByTierID(ctx context.Context, tierID string) ([]domain.RateLimit, error) {
	query := `
		SELECT id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at
		FROM rate_limits
		WHERE tier_id = ?
	`

	rows, err := r.db.QueryContext(ctx, query, tierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rateLimits []domain.RateLimit
	for rows.Next() {
		var rateLimit domain.RateLimit
		if err := rows.Scan(
			&rateLimit.ID,
			&rateLimit.ModelID,
			&rateLimit.TierID,
			&rateLimit.RequestsPerMinute,
			&rateLimit.RequestsPerDay,
			&rateLimit.TokensPerMinute,
			&rateLimit.TokensPerDay,
			&rateLimit.CreatedAt,
			&rateLimit.UpdatedAt,
		); err != nil {
			return nil, err
		}
		rateLimits = append(rateLimits, rateLimit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rateLimits, nil
}
