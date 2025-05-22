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

type userRepository struct {
	db *sqlx.DB
}

// NewMysqlUserRepository создает новый репозиторий пользователей
func NewMysqlUserRepository(db *sqlx.DB) *userRepository {
	return &userRepository{
		db: db,
	}
}

// Create создает нового пользователя
func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	if user.ID == "" {
		user.ID = uuid.New().String()
	}

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
		INSERT INTO users (id, email, password_hash, tier_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.TierID,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

// FindByID находит пользователя по ID
func (r *userRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, tier_id, created_at, updated_at
		FROM users
		WHERE id = ?
	`

	var user domain.User
	err := r.db.QueryRowxContext(ctx, query, id).StructScan(&user)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("пользователь не найден")
		}
		return nil, err
	}

	return &user, nil
}

// FindByEmail находит пользователя по email
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, tier_id, created_at, updated_at
		FROM users
		WHERE email = ?
	`

	var user domain.User
	err := r.db.QueryRowxContext(ctx, query, email).StructScan(&user)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("пользователь не найден")
		}
		return nil, err
	}

	return &user, nil
}

// Update обновляет данные пользователя
func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET email = ?, password_hash = ?, tier_id = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		user.Email,
		user.PasswordHash,
		user.TierID,
		user.UpdatedAt,
		user.ID,
	)

	return err
}

// Delete удаляет пользователя
func (r *userRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List возвращает список пользователей с пагинацией
func (r *userRepository) List(ctx context.Context, offset, limit int) ([]domain.User, error) {
	query := `
		SELECT id, email, password_hash, tier_id, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.QueryxContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var user domain.User
		if err := rows.StructScan(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// Count возвращает общее количество пользователей
func (r *userRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM users`

	var count int
	err := r.db.QueryRowxContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
