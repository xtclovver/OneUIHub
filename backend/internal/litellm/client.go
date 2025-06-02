package litellm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"oneui-hub/internal/config"
	"oneui-hub/internal/domain"
)

type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

type LiteLLMModel struct {
	ID        string                 `json:"id"`
	Object    string                 `json:"object"`
	OwnedBy   string                 `json:"owned_by"`
	MaxTokens int                    `json:"max_tokens,omitempty"`
	Pricing   *LiteLLMPricing        `json:"pricing,omitempty"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

type LiteLLMPricing struct {
	InputCost  float64 `json:"input_cost_per_token"`
	OutputCost float64 `json:"output_cost_per_token"`
}

// Структуры для model_group/info эндпоинта
type LiteLLMModelGroupResponse struct {
	Data []LiteLLMModelGroup `json:"data"`
}

type LiteLLMModelGroup struct {
	ModelGroup                       string   `json:"model_group"`
	Providers                        []string `json:"providers"`
	MaxInputTokens                   float64  `json:"max_input_tokens"`
	MaxOutputTokens                  float64  `json:"max_output_tokens"`
	InputCostPerToken                float64  `json:"input_cost_per_token"`
	OutputCostPerToken               float64  `json:"output_cost_per_token"`
	Mode                             string   `json:"mode"`
	TPM                              *int     `json:"tpm"`
	RPM                              *int     `json:"rpm"`
	SupportsParallelFunctionCalling  bool     `json:"supports_parallel_function_calling"`
	SupportsVision                   bool     `json:"supports_vision"`
	SupportsWebSearch                bool     `json:"supports_web_search"`
	SupportsReasoning                bool     `json:"supports_reasoning"`
	SupportsFunctionCalling          bool     `json:"supports_function_calling"`
	SupportedOpenAIParams            []string `json:"supported_openai_params"`
	ConfigurableClientsideAuthParams *string  `json:"configurable_clientside_auth_params"`
}

// Структуры для управления моделями
type LiteLLMModelRequest struct {
	ModelName     string                 `json:"model_name"`
	LiteLLMParams map[string]interface{} `json:"litellm_params"`
	ModelInfo     *LiteLLMModelInfo      `json:"model_info,omitempty"`
}

type LiteLLMModelInfo struct {
	ID         string   `json:"id,omitempty"`
	Mode       string   `json:"mode,omitempty"`
	InputCost  *float64 `json:"input_cost_per_token,omitempty"`
	OutputCost *float64 `json:"output_cost_per_token,omitempty"`
	MaxTokens  *int     `json:"max_tokens,omitempty"`
	BaseModel  string   `json:"base_model,omitempty"`
}

type LiteLLMModelUpdateRequest struct {
	ModelID   string            `json:"model_id"`
	ModelInfo *LiteLLMModelInfo `json:"model_info,omitempty"`
	ModelName string            `json:"model_name,omitempty"`
}

type LiteLLMModelDeleteRequest struct {
	ID string `json:"id"`
}

// Структуры для управления бюджетами
type LiteLLMBudgetRequest struct {
	UserID         string     `json:"user_id,omitempty"`
	TeamID         string     `json:"team_id,omitempty"`
	MaxBudget      *float64   `json:"max_budget,omitempty"`
	BudgetDuration string     `json:"budget_duration,omitempty"`
	ResetAt        *time.Time `json:"reset_at,omitempty"`
}

type LiteLLMBudgetResponse struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	TeamID         string     `json:"team_id"`
	MaxBudget      float64    `json:"max_budget"`
	SpentBudget    float64    `json:"spent_budget"`
	BudgetDuration string     `json:"budget_duration"`
	ResetAt        *time.Time `json:"reset_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type LiteLLMBudgetUpdateRequest struct {
	ID             string     `json:"id"`
	MaxBudget      *float64   `json:"max_budget,omitempty"`
	BudgetDuration *string    `json:"budget_duration,omitempty"`
	ResetAt        *time.Time `json:"reset_at,omitempty"`
}

type LiteLLMKeyRequest struct {
	KeyAlias  string                 `json:"key_alias,omitempty"`
	TeamID    string                 `json:"team_id,omitempty"`
	UserID    string                 `json:"user_id,omitempty"`
	MaxBudget *float64               `json:"max_budget,omitempty"`
	ExpiresAt *time.Time             `json:"expires,omitempty"`
	Models    []string               `json:"models,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

type LiteLLMKeyResponse struct {
	Key       string     `json:"key"`
	KeyName   string     `json:"key_name"`
	UserID    string     `json:"user_id"`
	TeamID    string     `json:"team_id"`
	ExpiresAt *time.Time `json:"expires"`
}

type LiteLLMUsageResponse struct {
	TotalCost   float64 `json:"total_cost"`
	TotalTokens int     `json:"total_tokens"`
	Model       string  `json:"model"`
}

// Структуры для логов запросов
type LiteLLMSpendLogEntry struct {
	RequestID        string                 `json:"request_id"`
	APIKey           string                 `json:"api_key"`
	Model            string                 `json:"model"`
	UserID           string                 `json:"user_id"`
	TeamID           string                 `json:"team_id"`
	RequestTags      []string               `json:"request_tags"`
	Spend            float64                `json:"spend"`
	TotalTokens      int                    `json:"total_tokens"`
	PromptTokens     int                    `json:"prompt_tokens"`
	CompletionTokens int                    `json:"completion_tokens"`
	StartTime        time.Time              `json:"startTime"`
	EndTime          time.Time              `json:"endTime"`
	APIBase          string                 `json:"api_base"`
	ModelGroup       string                 `json:"model_group"`
	StatusCode       int                    `json:"status_code"`
	RequestData      map[string]interface{} `json:"request_data,omitempty"`
	ResponseData     map[string]interface{} `json:"response_data,omitempty"`
}

type LiteLLMSpendLogsResponse struct {
	Data []LiteLLMSpendLogEntry `json:"data"`
}

func NewClient(cfg *config.LiteLLMConfig) *Client {
	return &Client{
		baseURL: cfg.BaseURL,
		apiKey:  cfg.APIKey,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

// Методы для работы с моделями
func (c *Client) GetModels(ctx context.Context) ([]*LiteLLMModel, error) {
	req, err := c.newRequest(ctx, "GET", "/models", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response struct {
		Data []*LiteLLMModel `json:"data"`
	}

	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get models: %w", err)
	}

	return response.Data, nil
}

func (c *Client) GetV1Models(ctx context.Context) ([]*LiteLLMModel, error) {
	req, err := c.newRequest(ctx, "GET", "/v1/models", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response struct {
		Data []*LiteLLMModel `json:"data"`
	}

	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get v1 models: %w", err)
	}

	return response.Data, nil
}

func (c *Client) GetModelInfo(ctx context.Context, modelID string) (*LiteLLMModel, error) {
	endpoint := fmt.Sprintf("/model/info?model=%s", modelID)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var model LiteLLMModel
	if err := c.doRequest(req, &model); err != nil {
		return nil, fmt.Errorf("failed to get model info: %w", err)
	}

	return &model, nil
}

func (c *Client) GetV1ModelInfo(ctx context.Context, modelID string) (*LiteLLMModel, error) {
	endpoint := fmt.Sprintf("/v1/model/info?model=%s", modelID)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var model LiteLLMModel
	if err := c.doRequest(req, &model); err != nil {
		return nil, fmt.Errorf("failed to get v1 model info: %w", err)
	}

	return &model, nil
}

func (c *Client) GetModelGroupInfo(ctx context.Context) (*LiteLLMModelGroupResponse, error) {
	req, err := c.newRequest(ctx, "GET", "/model_group/info", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMModelGroupResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get model group info: %w", err)
	}

	return &response, nil
}

func (c *Client) CreateModel(ctx context.Context, modelReq *LiteLLMModelRequest) error {
	req, err := c.newRequest(ctx, "POST", "/model/new", modelReq)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to create model: %w", err)
	}

	return nil
}

func (c *Client) UpdateModel(ctx context.Context, modelReq *LiteLLMModelUpdateRequest) error {
	req, err := c.newRequest(ctx, "POST", "/model/update", modelReq)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to update model: %w", err)
	}

	return nil
}

func (c *Client) PatchModel(ctx context.Context, modelID string, modelReq *LiteLLMModelUpdateRequest) error {
	endpoint := fmt.Sprintf("/model/%s/update", modelID)
	req, err := c.newRequest(ctx, "PATCH", endpoint, modelReq)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to patch model: %w", err)
	}

	return nil
}

func (c *Client) DeleteModel(ctx context.Context, modelID string) error {
	reqBody := &LiteLLMModelDeleteRequest{ID: modelID}
	req, err := c.newRequest(ctx, "POST", "/model/delete", reqBody)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}

	return nil
}

// Методы для работы с бюджетами
func (c *Client) CreateBudget(ctx context.Context, budgetReq *LiteLLMBudgetRequest) (*LiteLLMBudgetResponse, error) {
	req, err := c.newRequest(ctx, "POST", "/budget/new", budgetReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMBudgetResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to create budget: %w", err)
	}

	return &response, nil
}

func (c *Client) UpdateBudget(ctx context.Context, budgetReq *LiteLLMBudgetUpdateRequest) (*LiteLLMBudgetResponse, error) {
	req, err := c.newRequest(ctx, "POST", "/budget/update", budgetReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMBudgetResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to update budget: %w", err)
	}

	return &response, nil
}

func (c *Client) GetBudgetInfo(ctx context.Context, budgetID string) (*LiteLLMBudgetResponse, error) {
	reqBody := map[string]string{"id": budgetID}
	req, err := c.newRequest(ctx, "POST", "/budget/info", reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMBudgetResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get budget info: %w", err)
	}

	return &response, nil
}

func (c *Client) GetBudgetSettings(ctx context.Context) (map[string]interface{}, error) {
	req, err := c.newRequest(ctx, "GET", "/budget/settings", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response map[string]interface{}
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get budget settings: %w", err)
	}

	return response, nil
}

func (c *Client) ListBudgets(ctx context.Context) ([]*LiteLLMBudgetResponse, error) {
	req, err := c.newRequest(ctx, "GET", "/budget/list", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response []*LiteLLMBudgetResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to list budgets: %w", err)
	}

	return response, nil
}

func (c *Client) DeleteBudget(ctx context.Context, budgetID string) error {
	reqBody := map[string]string{"id": budgetID}
	req, err := c.newRequest(ctx, "POST", "/budget/delete", reqBody)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to delete budget: %w", err)
	}

	return nil
}

// Существующие методы
func (c *Client) CreateKey(ctx context.Context, keyReq *LiteLLMKeyRequest) (*LiteLLMKeyResponse, error) {
	req, err := c.newRequest(ctx, "POST", "/key/generate", keyReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMKeyResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to create key: %w", err)
	}

	return &response, nil
}

func (c *Client) DeleteKey(ctx context.Context, keyID string) error {
	// Попробуем несколько способов удаления ключа

	// Способ 1: Стандартный метод с полем "key"
	reqBody1 := map[string]string{"key": keyID}
	req1, err := c.newRequest(ctx, "POST", "/key/delete", reqBody1)
	if err == nil {
		if err := c.doRequest(req1, nil); err == nil {
			return nil
		}
		fmt.Printf("DeleteKey: Method 1 failed: %v\n", err)
	}

	// Способ 2: Попробуем с полем "keys" (массив)
	reqBody2 := map[string]interface{}{"keys": []string{keyID}}
	req2, err := c.newRequest(ctx, "POST", "/key/delete", reqBody2)
	if err == nil {
		if err := c.doRequest(req2, nil); err == nil {
			return nil
		}
		fmt.Printf("DeleteKey: Method 2 failed: %v\n", err)
	}

	// Способ 3: Попробуем как GET запрос
	endpoint := fmt.Sprintf("/key/delete?key=%s", keyID)
	req3, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err == nil {
		if err := c.doRequest(req3, nil); err == nil {
			return nil
		}
		fmt.Printf("DeleteKey: Method 3 failed: %v\n", err)
	}

	// Способ 4: Попробуем DELETE метод
	endpoint4 := fmt.Sprintf("/key/%s", keyID)
	req4, err := c.newRequest(ctx, "DELETE", endpoint4, nil)
	if err == nil {
		if err := c.doRequest(req4, nil); err == nil {
			return nil
		}
		fmt.Printf("DeleteKey: Method 4 failed: %v\n", err)
	}

	return fmt.Errorf("failed to delete key %s using all available methods", keyID)
}

func (c *Client) GetUsage(ctx context.Context, keyID string) (*LiteLLMUsageResponse, error) {
	endpoint := fmt.Sprintf("/spend/logs?key=%s", keyID)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMUsageResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get usage: %w", err)
	}

	return &response, nil
}

func (c *Client) ConvertToDomainModels(litellmModels []*LiteLLMModel) ([]*domain.Model, []*domain.Company) {
	var models []*domain.Model
	companyMap := make(map[string]*domain.Company)

	for _, lm := range litellmModels {
		// Создаем компанию если её нет
		if _, exists := companyMap[lm.OwnedBy]; !exists {
			companyMap[lm.OwnedBy] = &domain.Company{
				Name:        lm.OwnedBy,
				ExternalID:  lm.OwnedBy,
				Description: fmt.Sprintf("AI models provider: %s", lm.OwnedBy),
			}
		}

		// Создаем модель
		model := &domain.Model{
			CompanyID:   companyMap[lm.OwnedBy].ID,
			Name:        lm.ID,
			ExternalID:  lm.ID,
			Description: fmt.Sprintf("AI model: %s", lm.ID),
		}

		models = append(models, model)
	}

	// Конвертируем карту компаний в слайс
	var companies []*domain.Company
	for _, company := range companyMap {
		companies = append(companies, company)
	}

	return models, companies
}

func (c *Client) newRequest(ctx context.Context, method, endpoint string, body interface{}) (*http.Request, error) {
	url := c.baseURL + endpoint

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
		req.Header.Set("x-litellm-api-key", c.apiKey)
	}

	return req, nil
}

func (c *Client) doRequest(req *http.Request, result interface{}) error {
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
	}

	if result != nil {
		if err := json.NewDecoder(resp.Body).Decode(result); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}
	}

	return nil
}

func (c *Client) GetSpendLogs(ctx context.Context, userID string, limit, offset int) (*LiteLLMSpendLogsResponse, error) {
	endpoint := fmt.Sprintf("/spend/logs?user_id=%s&limit=%d&offset=%d", userID, limit, offset)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response LiteLLMSpendLogsResponse
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get spend logs: %w", err)
	}

	return &response, nil
}

// GetSpendLogsByAPIKey получает логи трат по API ключу (как в curl примере)
func (c *Client) GetSpendLogsByAPIKey(ctx context.Context, apiKey string) ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/spend/logs?api_key=%s", apiKey)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Добавляем заголовок x-litellm-api-key как в curl примере
	req.Header.Set("x-litellm-api-key", c.apiKey)

	var response []map[string]interface{}
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get spend logs: %w", err)
	}

	return response, nil
}

func (c *Client) GetKeyInfo(ctx context.Context, keyID string) (map[string]interface{}, error) {
	reqBody := map[string]string{"key": keyID}
	req, err := c.newRequest(ctx, "POST", "/key/info", reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response map[string]interface{}
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to get key info: %w", err)
	}

	return response, nil
}

func (c *Client) ListKeys(ctx context.Context) ([]map[string]interface{}, error) {
	req, err := c.newRequest(ctx, "GET", "/key/list", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var response []map[string]interface{}
	if err := c.doRequest(req, &response); err != nil {
		return nil, fmt.Errorf("failed to list keys: %w", err)
	}

	return response, nil
}

// GetKeyUsageStats получает статистику использования для конкретного API ключа
func (c *Client) GetKeyUsageStats(ctx context.Context, apiKey string) (map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/spend/logs?api_key=%s", apiKey)
	req, err := c.newRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	var logs []map[string]interface{}
	if err := c.doRequest(req, &logs); err != nil {
		return nil, fmt.Errorf("failed to get key usage stats: %w", err)
	}

	// Подсчитываем статистику
	stats := map[string]interface{}{
		"usage_count":    len(logs),
		"total_cost":     0.0,
		"total_tokens":   0,
		"last_used":      "",
		"models_used":    make(map[string]int),
		"providers_used": make(map[string]int),
	}

	if len(logs) == 0 {
		return stats, nil
	}

	totalCost := 0.0
	totalTokens := 0
	modelsUsed := make(map[string]int)
	providersUsed := make(map[string]int)
	var lastUsed string

	for _, log := range logs {
		// Стоимость
		if spend, ok := log["spend"].(float64); ok {
			totalCost += spend
		}

		// Токены
		if tokens, ok := log["total_tokens"].(float64); ok {
			totalTokens += int(tokens)
		}

		// Модели
		if model, ok := log["model"].(string); ok && model != "" {
			modelsUsed[model]++
		}

		// Провайдеры
		if provider, ok := log["custom_llm_provider"].(string); ok && provider != "" {
			providersUsed[provider]++
		}

		// Последнее использование
		if startTime, ok := log["startTime"].(string); ok {
			if lastUsed == "" || startTime > lastUsed {
				lastUsed = startTime
			}
		}
	}

	stats["total_cost"] = totalCost
	stats["total_tokens"] = totalTokens
	stats["last_used"] = lastUsed
	stats["models_used"] = modelsUsed
	stats["providers_used"] = providersUsed

	return stats, nil
}
