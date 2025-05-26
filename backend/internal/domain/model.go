package domain

import (
	"time"
)

type Model struct {
	ID          string `json:"id" gorm:"type:varchar(36);primaryKey"`
	CompanyID   string `json:"company_id" gorm:"type:varchar(36);not null"`
	Name        string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:text"`
	Features    string `json:"features" gorm:"type:text"`
	ExternalID  string `json:"external_id" gorm:"type:varchar(255);uniqueIndex"`

	// Новые поля из LiteLLM
	Providers                       string `json:"providers" gorm:"type:text"` // JSON массив провайдеров
	MaxInputTokens                  *int   `json:"max_input_tokens" gorm:"type:int"`
	MaxOutputTokens                 *int   `json:"max_output_tokens" gorm:"type:int"`
	Mode                            string `json:"mode" gorm:"type:varchar(50)"`
	SupportsParallelFunctionCalling bool   `json:"supports_parallel_function_calling" gorm:"default:false"`
	SupportsVision                  bool   `json:"supports_vision" gorm:"default:false"`
	SupportsWebSearch               bool   `json:"supports_web_search" gorm:"default:false"`
	SupportsReasoning               bool   `json:"supports_reasoning" gorm:"default:false"`
	SupportsFunctionCalling         bool   `json:"supports_function_calling" gorm:"default:false"`
	SupportedOpenAIParams           string `json:"supported_openai_params" gorm:"type:text;column:supported_openai_params"` // JSON массив

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`

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
	ID              string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	ModelID         string    `json:"model_id" gorm:"type:varchar(36);not null"`
	IsFree          bool      `json:"is_free" gorm:"default:false"`
	IsEnabled       bool      `json:"is_enabled" gorm:"default:true"`
	InputTokenCost  *float64  `json:"input_token_cost" gorm:"type:decimal(10,6)"`
	OutputTokenCost *float64  `json:"output_token_cost" gorm:"type:decimal(10,6)"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Связи
	Model *Model `json:"model,omitempty" gorm:"foreignKey:ModelID"`
}

func (ModelConfig) TableName() string {
	return "model_configs"
}
