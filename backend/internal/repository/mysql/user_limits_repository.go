package mysql

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/oneaihub/backend/internal/domain"
)

type userLimitsRepository struct {
	db *sqlx.DB
}

// NewUserLimitsRepository создает новый репозиторий лимитов пользователей
func NewUserLimitsRepository(db *sqlx.DB) *userLimitsRepository {
	return &userLimitsRepository{
		db: db,
	}
}

// Create создает новые лимиты пользователя
func (r *userLimitsRepository) Create(ctx context.Context, limits *domain.UserLimits) error {
	query := `
		INSERT INTO user_limits (user_id, monthly_token_limit, balance)
		VALUES (?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		limits.UserID,
		limits.MonthlyTokenLimit,
		limits.Balance,
	)

	return err
}

// FindByUserID находит лимиты пользователя по user ID
func (r *userLimitsRepository) FindByUserID(ctx context.Context, userID string) (*domain.UserLimits, error) {
	query := `
		SELECT user_id, monthly_token_limit, balance
		FROM user_limits
		WHERE user_id = ?
	`

	var limits domain.UserLimits
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&limits.UserID,
		&limits.MonthlyTokenLimit,
		&limits.Balance,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("лимиты пользователя не найдены")
		}
		return nil, err
	}

	return &limits, nil
}

// Update обновляет лимиты пользователя
func (r *userLimitsRepository) Update(ctx context.Context, limits *domain.UserLimits) error {
	query := `
		UPDATE user_limits
		SET monthly_token_limit = ?, balance = ?
		WHERE user_id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		limits.MonthlyTokenLimit,
		limits.Balance,
		limits.UserID,
	)

	return err
}

// Delete удаляет лимиты пользователя
func (r *userLimitsRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM user_limits WHERE user_id = ?`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

// GetByUserID получает лимиты пользователя по ID пользователя (алиас для FindByUserID)
func (r *userLimitsRepository) GetByUserID(ctx context.Context, userID string) (*domain.UserLimits, error) {
	return r.FindByUserID(ctx, userID)
}
