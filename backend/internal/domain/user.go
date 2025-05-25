package domain

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleCustomer   UserRole = "customer"
	RoleEnterprise UserRole = "enterprise"
	RoleSupport    UserRole = "support"
	RoleAdmin      UserRole = "admin"
)

type User struct {
	ID           string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	Email        string         `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name         *string        `json:"name,omitempty" gorm:"type:varchar(255)"`
	PasswordHash string         `json:"-" gorm:"type:varchar(255);not null"`
	TierID       string         `json:"tier_id" gorm:"type:varchar(36);not null"`
	Role         UserRole       `json:"role" gorm:"type:enum('customer','enterprise','support','admin');default:'customer'"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Tier      *Tier      `json:"tier,omitempty" gorm:"foreignKey:TierID"`
	UserLimit *UserLimit `json:"user_limit,omitempty" gorm:"foreignKey:UserID"`
	ApiKeys   []ApiKey   `json:"api_keys,omitempty" gorm:"foreignKey:UserID"`
	Requests  []Request  `json:"requests,omitempty" gorm:"foreignKey:UserID"`
}

func (User) TableName() string {
	return "users"
}

type UserLimit struct {
	UserID            string  `json:"user_id" gorm:"type:varchar(36);primaryKey"`
	MonthlyTokenLimit *int64  `json:"monthly_token_limit" gorm:"type:bigint"`
	Balance           float64 `json:"balance" gorm:"type:decimal(10,2);default:0.00"`

	// Связи
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (UserLimit) TableName() string {
	return "user_limits"
}
