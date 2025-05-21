package mysql

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
)

type requestRepository struct {
	db *sql.DB
}

// NewRequestRepository создает новый репозиторий запросов
func NewRequestRepository(db *sql.DB) *requestRepository {
	return &requestRepository{
		db: db,
	}
}

// Create создает новый запрос
func (r *requestRepository) Create(ctx context.Context, request *domain.Request) error {
	if request.ID == "" {
		request.ID = uuid.New().String()
	}

	request.CreatedAt = time.Now()

	query := `
		INSERT INTO requests (id, user_id, model_id, input_tokens, output_tokens, input_cost, output_cost, total_cost, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		request.ID,
		request.UserID,
		request.ModelID,
		request.InputTokens,
		request.OutputTokens,
		request.InputCost,
		request.OutputCost,
		request.TotalCost,
		request.CreatedAt,
	)

	return err
}

// FindByID находит запрос по ID
func (r *requestRepository) FindByID(ctx context.Context, id string) (*domain.Request, error) {
	query := `
		SELECT id, user_id, model_id, input_tokens, output_tokens, input_cost, output_cost, total_cost, created_at
		FROM requests
		WHERE id = ?
	`

	var request domain.Request
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&request.ID,
		&request.UserID,
		&request.ModelID,
		&request.InputTokens,
		&request.OutputTokens,
		&request.InputCost,
		&request.OutputCost,
		&request.TotalCost,
		&request.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("запрос не найден")
		}
		return nil, err
	}

	return &request, nil
}

// ListByUserID возвращает список запросов пользователя
func (r *requestRepository) ListByUserID(ctx context.Context, userID string, offset, limit int) ([]domain.Request, error) {
	query := `
		SELECT id, user_id, model_id, input_tokens, output_tokens, input_cost, output_cost, total_cost, created_at
		FROM requests
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []domain.Request
	for rows.Next() {
		var request domain.Request
		if err := rows.Scan(
			&request.ID,
			&request.UserID,
			&request.ModelID,
			&request.InputTokens,
			&request.OutputTokens,
			&request.InputCost,
			&request.OutputCost,
			&request.TotalCost,
			&request.CreatedAt,
		); err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return requests, nil
}

// CountByUserID возвращает количество запросов пользователя
func (r *requestRepository) CountByUserID(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM requests
		WHERE user_id = ?
	`

	var count int
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// ListByModelID возвращает список запросов по модели
func (r *requestRepository) ListByModelID(ctx context.Context, modelID string, offset, limit int) ([]domain.Request, error) {
	query := `
		SELECT id, user_id, model_id, input_tokens, output_tokens, input_cost, output_cost, total_cost, created_at
		FROM requests
		WHERE model_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.QueryContext(ctx, query, modelID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []domain.Request
	for rows.Next() {
		var request domain.Request
		if err := rows.Scan(
			&request.ID,
			&request.UserID,
			&request.ModelID,
			&request.InputTokens,
			&request.OutputTokens,
			&request.InputCost,
			&request.OutputCost,
			&request.TotalCost,
			&request.CreatedAt,
		); err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return requests, nil
}
