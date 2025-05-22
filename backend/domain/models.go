package domain

import (
	"time"
)

// UserRole - роль пользователя в системе
type UserRole string

const (
	RoleAdmin    UserRole = "admin"    // Администратор
	RoleEmployee UserRole = "employee" // Сотрудник
	RoleCustomer UserRole = "customer" // Обычный пользователь
)

// User - данные пользователя
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	TierID       string    `json:"tier_id" db:"tier_id"`
	Role         UserRole  `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// Tier - тир подписки с разными лимитами
type Tier struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	IsFree      bool      `json:"is_free" db:"is_free"`
	Price       float64   `json:"price" db:"price"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Company - компания-провайдер моделей
type Company struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	LogoURL     string    `json:"logo_url" db:"logo_url"`
	Description string    `json:"description" db:"description"`
	ExternalID  string    `json:"external_id" db:"external_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Model - модель ИИ
type Model struct {
	ID          string    `json:"id" db:"id"`
	CompanyID   string    `json:"company_id" db:"company_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Features    string    `json:"features" db:"features"`
	ExternalID  string    `json:"external_id" db:"external_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// ModelConfig - настройки модели, устанавливаемые администратором
type ModelConfig struct {
	ID              string    `json:"id" db:"id"`
	ModelID         string    `json:"model_id" db:"model_id"`
	IsFree          bool      `json:"is_free" db:"is_free"`
	IsEnabled       bool      `json:"is_enabled" db:"is_enabled"`
	InputTokenCost  float64   `json:"input_token_cost" db:"input_token_cost"`
	OutputTokenCost float64   `json:"output_token_cost" db:"output_token_cost"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// RateLimit - ограничения запросов для каждой модели по тирам
type RateLimit struct {
	ID                string    `json:"id" db:"id"`
	ModelID           string    `json:"model_id" db:"model_id"`
	TierID            string    `json:"tier_id" db:"tier_id"`
	RequestsPerMinute int       `json:"requests_per_minute" db:"requests_per_minute"`
	RequestsPerDay    int       `json:"requests_per_day" db:"requests_per_day"`
	TokensPerMinute   int       `json:"tokens_per_minute" db:"tokens_per_minute"`
	TokensPerDay      int       `json:"tokens_per_day" db:"tokens_per_day"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// ApiKey - ключи API и их привязка к пользователям
type ApiKey struct {
	ID         string     `json:"id" db:"id"`
	UserID     string     `json:"user_id" db:"user_id"`
	KeyHash    string     `json:"-" db:"key_hash"`
	ExternalID string     `json:"external_id" db:"external_id"`
	Name       string     `json:"name" db:"name"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	ExpiresAt  *time.Time `json:"expires_at" db:"expires_at"`
}

// Request - история запросов пользователя с токенами и стоимостью
type Request struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"user_id" db:"user_id"`
	ModelID      string    `json:"model_id" db:"model_id"`
	InputTokens  int       `json:"input_tokens" db:"input_tokens"`
	OutputTokens int       `json:"output_tokens" db:"output_tokens"`
	InputCost    float64   `json:"input_cost" db:"input_cost"`
	OutputCost   float64   `json:"output_cost" db:"output_cost"`
	TotalCost    float64   `json:"total_cost" db:"total_cost"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// UserLimits - лимиты и баланс пользователя
type UserLimits struct {
	UserID            string  `json:"user_id" db:"user_id"`
	MonthlyTokenLimit int64   `json:"monthly_token_limit" db:"monthly_token_limit"`
	Balance           float64 `json:"balance" db:"balance"`
}

// Response - структура ответа для API
type Response struct {
	Content string `json:"content"`
	Tokens  int    `json:"tokens"`
}

// Usage - учёт использования (для биллинга)
type Usage struct {
	UserID      string  `json:"user_id"`
	TotalTokens int     `json:"total_tokens"`
	TotalCost   float64 `json:"total_cost"`
	Period      string  `json:"period"`
}
