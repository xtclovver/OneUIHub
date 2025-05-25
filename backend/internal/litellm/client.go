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

func NewClient(cfg *config.LiteLLMConfig) *Client {
	return &Client{
		baseURL: cfg.BaseURL,
		apiKey:  cfg.APIKey,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

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
	reqBody := map[string]string{"key": keyID}
	req, err := c.newRequest(ctx, "POST", "/key/delete", reqBody)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if err := c.doRequest(req, nil); err != nil {
		return fmt.Errorf("failed to delete key: %w", err)
	}

	return nil
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
