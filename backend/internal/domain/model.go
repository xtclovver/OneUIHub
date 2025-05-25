package domain

import (
	"time"

	"gorm.io/gorm"
)

type Model struct {
	ID          string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	CompanyID   string         `json:"company_id" gorm:"type:varchar(36);not null"`
	Name        string         `json:"name" gorm:"type:varchar(255);not null"`
	Description string         `json:"description" gorm:"type:text"`
	Features    string         `json:"features" gorm:"type:text"`
	ExternalID  string         `json:"external_id" gorm:"type:varchar(255);uniqueIndex"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Company     *Company     `json:"company,omitempty" gorm:"foreignKey:CompanyID"`
	ModelConfig *ModelConfig `json:"model_config,omitempty" gorm:"foreignKey:ModelID"`
	RateLimits  []RateLimit  `json:"rate_limits,omitempty" gorm:"foreignKey:ModelID"`
	Requests    []Request    `json:"requests,omitempty" gorm:"foreignKey:ModelID"`
}

func (Model) TableName() string {
	return "models"
}

type ModelConfig struct {
	ID              string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	ModelID         string         `json:"model_id" gorm:"type:varchar(36);not null"`
	IsFree          bool           `json:"is_free" gorm:"default:false"`
	IsEnabled       bool           `json:"is_enabled" gorm:"default:true"`
	InputTokenCost  *float64       `json:"input_token_cost" gorm:"type:decimal(10,6)"`
	OutputTokenCost *float64       `json:"output_token_cost" gorm:"type:decimal(10,6)"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Model *Model `json:"model,omitempty" gorm:"foreignKey:ModelID"`
}

func (ModelConfig) TableName() string {
	return "model_configs"
}
