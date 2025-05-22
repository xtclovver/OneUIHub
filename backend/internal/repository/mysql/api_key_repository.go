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

type apiKeyRepository struct {
	db *sqlx.DB
}

// NewApiKeyRepository создает новый репозиторий API ключей
func NewApiKeyRepository(db *sqlx.DB) *apiKeyRepository {
	return &apiKeyRepository{
		db: db,
	}
}

// Create создает новый API ключ
func (r *apiKeyRepository) Create(ctx context.Context, apiKey *domain.ApiKey) error {
	if apiKey.ID == "" {
		apiKey.ID = uuid.New().String()
	}

	apiKey.CreatedAt = time.Now()

	query := `
		INSERT INTO api_keys (id, user_id, key_hash, external_id, name, created_at, expires_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		apiKey.ID,
		apiKey.UserID,
		apiKey.KeyHash,
		apiKey.ExternalID,
		apiKey.Name,
		apiKey.CreatedAt,
		apiKey.ExpiresAt,
	)

	return err
}

// FindByID находит API ключ по ID
func (r *apiKeyRepository) FindByID(ctx context.Context, id string) (*domain.ApiKey, error) {
	query := `
		SELECT id, user_id, key_hash, external_id, name, created_at, expires_at
		FROM api_keys
		WHERE id = ?
	`

	var apiKey domain.ApiKey
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&apiKey.ID,
		&apiKey.UserID,
		&apiKey.KeyHash,
		&apiKey.ExternalID,
		&apiKey.Name,
		&apiKey.CreatedAt,
		&apiKey.ExpiresAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("API ключ не найден")
		}
		return nil, err
	}

	return &apiKey, nil
}

// FindByUserID находит API ключи пользователя
func (r *apiKeyRepository) FindByUserID(ctx context.Context, userID string) ([]domain.ApiKey, error) {
	query := `
		SELECT id, user_id, key_hash, external_id, name, created_at, expires_at
		FROM api_keys
		WHERE user_id = ?
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apiKeys []domain.ApiKey
	for rows.Next() {
		var apiKey domain.ApiKey
		if err := rows.Scan(
			&apiKey.ID,
			&apiKey.UserID,
			&apiKey.KeyHash,
			&apiKey.ExternalID,
			&apiKey.Name,
			&apiKey.CreatedAt,
			&apiKey.ExpiresAt,
		); err != nil {
			return nil, err
		}
		apiKeys = append(apiKeys, apiKey)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return apiKeys, nil
}

// FindByKeyHash находит API ключ по хешу ключа
func (r *apiKeyRepository) FindByKeyHash(ctx context.Context, keyHash string) (*domain.ApiKey, error) {
	query := `
		SELECT id, user_id, key_hash, external_id, name, created_at, expires_at
		FROM api_keys
		WHERE key_hash = ?
	`

	var apiKey domain.ApiKey
	err := r.db.QueryRowContext(ctx, query, keyHash).Scan(
		&apiKey.ID,
		&apiKey.UserID,
		&apiKey.KeyHash,
		&apiKey.ExternalID,
		&apiKey.Name,
		&apiKey.CreatedAt,
		&apiKey.ExpiresAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("API ключ не найден")
		}
		return nil, err
	}

	return &apiKey, nil
}

// Delete удаляет API ключ
func (r *apiKeyRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM api_keys WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// FindByKey находит API ключ по значению ключа
func (r *apiKeyRepository) FindByKey(ctx context.Context, key string) (*domain.ApiKey, error) {
	query := `
		SELECT id, user_id, key_hash, external_id, name, created_at, expires_at
		FROM api_keys
		WHERE key_hash = ?
	`

	var apiKey domain.ApiKey
	err := r.db.QueryRowContext(ctx, query, key).Scan(
		&apiKey.ID,
		&apiKey.UserID,
		&apiKey.KeyHash,
		&apiKey.ExternalID,
		&apiKey.Name,
		&apiKey.CreatedAt,
		&apiKey.ExpiresAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("API ключ не найден")
		}
		return nil, err
	}

	return &apiKey, nil
}
