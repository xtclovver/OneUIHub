package domain

import (
	"time"
)

// User представляет собой модель пользователя системы
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	TierID       string    `json:"tier_id" db:"tier_id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// UserRegister содержит данные для регистрации пользователя
type UserRegister struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// UserLogin содержит данные для входа пользователя
type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse содержит данные пользователя для ответа API
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	TierID    string    `json:"tier_id"`
	TierName  string    `json:"tier_name,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
