package domain

import (
	"time"

	"gorm.io/gorm"
)

type RateLimit struct {
	ID                string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	ModelID           string         `json:"model_id" gorm:"type:varchar(36);not null"`
	TierID            string         `json:"tier_id" gorm:"type:varchar(36);not null"`
	RequestsPerMinute int            `json:"requests_per_minute" gorm:"default:0"`
	RequestsPerDay    int            `json:"requests_per_day" gorm:"default:0"`
	TokensPerMinute   int            `json:"tokens_per_minute" gorm:"default:0"`
	TokensPerDay      int            `json:"tokens_per_day" gorm:"default:0"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Model *Model `json:"model,omitempty" gorm:"foreignKey:ModelID"`
	Tier  *Tier  `json:"tier,omitempty" gorm:"foreignKey:TierID"`
}

func (RateLimit) TableName() string {
	return "rate_limits"
}
