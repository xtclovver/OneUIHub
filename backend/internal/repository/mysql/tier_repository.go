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

type tierRepository struct {
	db *sqlx.DB
}

// NewMysqlTierRepository создает новый репозиторий тиров
func NewMysqlTierRepository(db *sqlx.DB) *tierRepository {
	return &tierRepository{
		db: db,
	}
}

// Create создает новый тир
func (r *tierRepository) Create(ctx context.Context, tier *domain.Tier) error {
	if tier.ID == "" {
		tier.ID = uuid.New().String()
	}

	query := `
		INSERT INTO tiers (id, name, description, is_free, price, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		tier.ID,
		tier.Name,
		tier.Description,
		tier.IsFree,
		tier.Price,
		time.Now(),
	)

	return err
}

// FindByID находит тир по ID
func (r *tierRepository) FindByID(ctx context.Context, id string) (*domain.Tier, error) {
	query := `
		SELECT id, name, description, is_free, price, created_at
		FROM tiers
		WHERE id = ?
	`

	var tier domain.Tier
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&tier.ID,
		&tier.Name,
		&tier.Description,
		&tier.IsFree,
		&tier.Price,
		&tier.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("тир не найден")
		}
		return nil, err
	}

	return &tier, nil
}

// Update обновляет данные тира
func (r *tierRepository) Update(ctx context.Context, tier *domain.Tier) error {
	query := `
		UPDATE tiers
		SET name = ?, description = ?, is_free = ?, price = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		tier.Name,
		tier.Description,
		tier.IsFree,
		tier.Price,
		tier.ID,
	)

	return err
}

// Delete удаляет тир
func (r *tierRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM tiers WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список тиров
func (r *tierRepository) List(ctx context.Context) ([]domain.Tier, error) {
	query := `
		SELECT id, name, description, is_free, price, created_at
		FROM tiers
		ORDER BY price ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tiers []domain.Tier
	for rows.Next() {
		var tier domain.Tier
		if err := rows.Scan(
			&tier.ID,
			&tier.Name,
			&tier.Description,
			&tier.IsFree,
			&tier.Price,
			&tier.CreatedAt,
		); err != nil {
			return nil, err
		}
		tiers = append(tiers, tier)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tiers, nil
}
