package domain

import (
	"time"

	"gorm.io/gorm"
)

type Tier struct {
	ID          string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	Name        string         `json:"name" gorm:"type:varchar(100);not null"`
	Description string         `json:"description" gorm:"type:text"`
	IsFree      bool           `json:"is_free" gorm:"default:false"`
	// Price - сумма в USD, которую нужно потратить для перехода на этот тариф
	Price       float64        `json:"price" gorm:"type:decimal(10,2);default:0.00"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Users      []User      `json:"users,omitempty" gorm:"foreignKey:TierID"`
	RateLimits []RateLimit `json:"rate_limits,omitempty" gorm:"foreignKey:TierID"`
}

func (Tier) TableName() string {
	return "tiers"
}
