package domain

import (
	"time"
)

type Budget struct {
	ID             string     `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID         *string    `json:"user_id" gorm:"type:varchar(36)"`
	TeamID         *string    `json:"team_id" gorm:"type:varchar(36)"`
	MaxBudget      float64    `json:"max_budget" gorm:"type:decimal(10,2);not null"`
	SpentBudget    float64    `json:"spent_budget" gorm:"type:decimal(10,2);default:0"`
	BudgetDuration string     `json:"budget_duration" gorm:"type:varchar(50);default:'monthly'"`
	ResetAt        *time.Time `json:"reset_at"`
	ExternalID     string     `json:"external_id" gorm:"type:varchar(255);uniqueIndex"`
	CreatedAt      time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Связи
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (Budget) TableName() string {
	return "budgets"
}
