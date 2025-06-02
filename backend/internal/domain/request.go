package domain

import (
	"time"
)

type Request struct {
	ID                string     `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID            string     `json:"user_id" gorm:"type:varchar(36);not null"`
	ModelID           string     `json:"model_id" gorm:"type:varchar(36)"`
	ApiKeyID          *string    `json:"api_key_id" gorm:"type:varchar(36)"`
	ExternalRequestID *string    `json:"external_request_id" gorm:"type:varchar(255)"`
	InputTokens       int        `json:"input_tokens" gorm:"not null"`
	OutputTokens      int        `json:"output_tokens" gorm:"not null"`
	InputCost         float64    `json:"input_cost" gorm:"type:decimal(10,6);not null"`
	OutputCost        float64    `json:"output_cost" gorm:"type:decimal(10,6);not null"`
	TotalCost         float64    `json:"total_cost" gorm:"type:decimal(10,6);not null"`
	Status            string     `json:"status" gorm:"type:varchar(50);default:completed"`
	CallType          *string    `json:"call_type" gorm:"type:varchar(50)"`
	ModelName         *string    `json:"model_name" gorm:"type:varchar(255)"`
	Provider          *string    `json:"provider" gorm:"type:varchar(100)"`
	StartTime         *time.Time `json:"start_time"`
	EndTime           *time.Time `json:"end_time"`
	CreatedAt         time.Time  `json:"created_at" gorm:"autoCreateTime"`

	// Связи
	User   *User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Model  *Model  `json:"model,omitempty" gorm:"foreignKey:ModelID"`
	ApiKey *ApiKey `json:"api_key,omitempty" gorm:"foreignKey:ApiKeyID"`
}

func (Request) TableName() string {
	return "requests"
}
