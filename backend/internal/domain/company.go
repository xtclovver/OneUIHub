package domain

import (
	"time"

	"gorm.io/gorm"
)

type Company struct {
	ID          string         `json:"id" gorm:"type:varchar(36);primaryKey"`
	Name        string         `json:"name" gorm:"type:varchar(255);not null"`
	LogoURL     string         `json:"logo_url" gorm:"type:varchar(255)"`
	Description string         `json:"description" gorm:"type:text"`
	ExternalID  string         `json:"external_id" gorm:"type:varchar(255);uniqueIndex"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Models []Model `json:"models,omitempty" gorm:"foreignKey:CompanyID"`
}

func (Company) TableName() string {
	return "companies"
}
