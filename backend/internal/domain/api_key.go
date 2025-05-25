package domain

import (
	"time"

	"gorm.io/gorm"
)

type ApiKey struct {
	ID         string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID     string         `json:"user_id" gorm:"type:varchar(36);not null"`
	KeyHash    string         `json:"-" gorm:"type:varchar(255);not null"`
	ExternalID string         `json:"external_id" gorm:"type:varchar(255)"`
	Name       string         `json:"name" gorm:"type:varchar(255)"`
	CreatedAt  time.Time      `json:"created_at"`
	ExpiresAt  *time.Time     `json:"expires_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (ApiKey) TableName() string {
	return "api_keys"
}
