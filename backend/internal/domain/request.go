package domain

import (
	"time"
)

type Request struct {
	ID           string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID       string    `json:"user_id" gorm:"type:varchar(36);not null"`
	ModelID      string    `json:"model_id" gorm:"type:varchar(36);not null"`
	InputTokens  int       `json:"input_tokens" gorm:"not null"`
	OutputTokens int       `json:"output_tokens" gorm:"not null"`
	InputCost    float64   `json:"input_cost" gorm:"type:decimal(10,6);not null"`
	OutputCost   float64   `json:"output_cost" gorm:"type:decimal(10,6);not null"`
	TotalCost    float64   `json:"total_cost" gorm:"type:decimal(10,6);not null"`
	CreatedAt    time.Time `json:"created_at"`

	// Связи
	User  *User  `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Model *Model `json:"model,omitempty" gorm:"foreignKey:ModelID"`
}

func (Request) TableName() string {
	return "requests"
}
