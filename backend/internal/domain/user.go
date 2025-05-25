package domain

import (
	"time"
)

// Определение дополнительных ролей пользователя
const (
	// RoleEnterprise - корпоративный клиент
	RoleEnterprise UserRole = "enterprise"

	// RoleSupport - сотрудник поддержки
	RoleSupport UserRole = "support"
)

// UserRole представляет роль пользователя в системе
type UserRole string

const (
	// UserRoleCustomer - обычный клиент
	UserRoleCustomer UserRole = "customer"

	// UserRoleAdmin - администратор системы
	UserRoleAdmin UserRole = "admin"
)

// User представляет модель пользователя системы
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	TierID       string    `json:"tier_id" db:"tier_id"`
	Role         UserRole  `json:"role" db:"role"`
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
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// UserService определяет интерфейс для работы с пользователями
type UserService interface {
	Create(user *User) error
	Update(user *User) error
	Delete(id string) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	List() ([]*User, error)
	VerifyPassword(email, password string) (*User, error)
	ChangePassword(id, newPassword string) error
	UpdateRole(id string, role UserRole) error
}

// UserRepository определяет интерфейс репозитория для работы с пользователями
type UserRepository interface {
	Create(user *User) error
	Update(user *User) error
	Delete(id string) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	List() ([]*User, error)
}

// AuthUser представляет аутентифицированного пользователя
type AuthUser struct {
	ID     string   `json:"id"`
	Email  string   `json:"email"`
	TierID string   `json:"tier_id"`
	Role   UserRole `json:"role"`
}

// HasAdminAccess проверяет, имеет ли пользователь права администратора
func (u *AuthUser) HasAdminAccess() bool {
	return u.Role == UserRoleAdmin
}

// HasSupportAccess проверяет, имеет ли пользователь права поддержки или выше
func (u *AuthUser) HasSupportAccess() bool {
	return u.Role == UserRoleAdmin || u.Role == RoleSupport
}

// IsEnterprise проверяет, является ли пользователь корпоративным клиентом
func (u *AuthUser) IsEnterprise() bool {
	return u.Role == RoleEnterprise
}

// RegisterRequest представляет запрос на регистрацию нового пользователя
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// LoginRequest представляет запрос на вход в систему
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UserUpdateRequest представляет запрос на обновление данных пользователя
type UserUpdateRequest struct {
	Email  string   `json:"email"`
	TierID string   `json:"tier_id"`
	Role   UserRole `json:"role"`
}

// PasswordChangeRequest представляет запрос на изменение пароля
type PasswordChangeRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}
