package domain

import (
	"time"
)

type Currency struct {
	ID     string `json:"id" gorm:"type:varchar(3);primaryKey"`
	Name   string `json:"name" gorm:"type:varchar(100);not null"`
	Symbol string `json:"symbol" gorm:"type:varchar(10);not null"`
}

func (Currency) TableName() string {
	return "currencies"
}

type ExchangeRate struct {
	ID           string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	FromCurrency string    `json:"from_currency" gorm:"type:varchar(3);not null"`
	ToCurrency   string    `json:"to_currency" gorm:"type:varchar(3);not null"`
	Rate         float64   `json:"rate" gorm:"type:decimal(15,8);not null"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Связи
	From *Currency `json:"from,omitempty" gorm:"foreignKey:FromCurrency"`
	To   *Currency `json:"to,omitempty" gorm:"foreignKey:ToCurrency"`
}

func (ExchangeRate) TableName() string {
	return "exchange_rates"
}

// UserSpending - для отслеживания общих трат пользователя
type UserSpending struct {
	UserID     string    `json:"user_id" gorm:"type:varchar(36);primaryKey"`
	TotalSpent float64   `json:"total_spent" gorm:"type:decimal(10,2);not null;default:0.00"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Связи
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (UserSpending) TableName() string {
	return "user_spendings"
}
