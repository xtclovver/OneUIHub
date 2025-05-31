package domain

import (
	"time"
)

type ApiKey struct {
	ID            string     `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID        string     `json:"user_id" gorm:"type:varchar(36);not null"`
	KeyHash       string     `json:"-" gorm:"type:varchar(255);not null"`
	OriginalKey   string     `json:"-" gorm:"type:text"`
	ApiKeyPreview string     `json:"api_key_preview" gorm:"type:varchar(20)"`
	ExternalID    string     `json:"external_id" gorm:"type:varchar(255)"`
	Name          string     `json:"name" gorm:"type:varchar(255)"`
	CreatedAt     time.Time  `json:"created_at" gorm:"autoCreateTime"`
	ExpiresAt     *time.Time `json:"expires_at"`

	// Связи
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (ApiKey) TableName() string {
	return "api_keys"
}
