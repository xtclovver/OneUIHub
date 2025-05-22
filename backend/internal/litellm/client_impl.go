package litellm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
)

// liteLLMClient реализация интерфейса LiteLLMClient
type liteLLMClient struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewLiteLLMClient создает новый клиент для работы с LiteLLM
func NewLiteLLMClient(baseURL, apiKey string) LiteLLMClient {
	return &liteLLMClient{
		baseURL:    baseURL,
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// GetModels возвращает список доступных моделей
func (c *liteLLMClient) GetModels(ctx context.Context) ([]domain.Model, error) {
	url := fmt.Sprintf("%s/v1/models", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Data []struct {
			ID       string `json:"id"`
			Provider string `json:"provider"`
			Name     string `json:"name"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	var models []domain.Model
	for _, model := range response.Data {
		models = append(models, domain.Model{
			ID:          uuid.New().String(),
			CompanyID:   model.Provider, // Временно используем provider как ID компании
			Name:        model.Name,
			Description: "", // Заполнится администратором позже
			Features:    "", // Заполнится администратором позже
			ExternalID:  model.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		})
	}

	return models, nil
}

// GetProviders возвращает список доступных провайдеров
func (c *liteLLMClient) GetProviders(ctx context.Context) ([]domain.Company, error) {
	url := fmt.Sprintf("%s/v1/providers", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Data []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Logo string `json:"logo_url"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	var companies []domain.Company
	for _, provider := range response.Data {
		companies = append(companies, domain.Company{
			ID:          uuid.New().String(),
			Name:        provider.Name,
			LogoURL:     provider.Logo,
			Description: "", // Заполнится администратором позже
			ExternalID:  provider.ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		})
	}

	return companies, nil
}

// CreateKey создает новый ключ API
func (c *liteLLMClient) CreateKey(ctx context.Context, userID string, expiresAt time.Time) (*domain.ApiKey, error) {
	url := fmt.Sprintf("%s/v1/key/generate", c.baseURL)

	payload := map[string]interface{}{
		"user_id":    userID,
		"expires_at": expiresAt.Format(time.RFC3339),
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("ошибка сериализации запроса: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Key       string    `json:"key"`
		ID        string    `json:"id"`
		ExpiresAt time.Time `json:"expires_at"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	// Хешируем ключ для безопасного хранения
	keyHash := hashKey(response.Key)

	apiKey := &domain.ApiKey{
		ID:         uuid.New().String(),
		UserID:     userID,
		KeyHash:    keyHash,
		ExternalID: response.ID,
		Name:       "LiteLLM API Key",
		CreatedAt:  time.Now(),
		ExpiresAt:  &response.ExpiresAt,
	}

	return apiKey, nil
}

// hashKey хеширует ключ API для безопасного хранения
func hashKey(key string) string {
	// В реальной реализации здесь должен быть безопасный алгоритм хеширования
	// Для простоты примера используем строку-заглушку
	return "hashed_" + key
}

// IsCachingAvailable проверяет доступность кэширования
func (c *liteLLMClient) IsCachingAvailable(ctx context.Context) (bool, error) {
	url := fmt.Sprintf("%s/v1/caching/status", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return false, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	// Если эндпоинт недоступен, считаем что кэширование недоступно
	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return false, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Available bool `json:"available"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return false, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	return response.Available, nil
}

// GetUsage возвращает информацию об использовании API
func (c *liteLLMClient) GetUsage(ctx context.Context, keyID string) (*domain.Usage, error) {
	url := fmt.Sprintf("%s/v1/usage?key_id=%s", c.baseURL, keyID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		UserID      string  `json:"user_id"`
		TotalTokens int     `json:"total_tokens"`
		TotalCost   float64 `json:"total_cost"`
		Period      string  `json:"period"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	usage := &domain.Usage{
		UserID:      response.UserID,
		TotalTokens: response.TotalTokens,
		TotalCost:   response.TotalCost,
		Period:      response.Period,
	}

	return usage, nil
}

// ProxyRequest проксирует запрос к модели
func (c *liteLLMClient) ProxyRequest(ctx context.Context, model string, request *domain.Request) (*domain.Response, error) {
	url := fmt.Sprintf("%s/v1/completions", c.baseURL)

	// Формируем запрос к API LiteLLM
	payload := map[string]interface{}{
		"model": model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": "Your content here", // Здесь должен быть контент из request
			},
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("ошибка сериализации запроса: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ошибка API (код %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Usage struct {
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	// Проверяем, что есть хотя бы один результат
	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("API вернул пустой результат")
	}

	// Формируем ответ
	result := &domain.Response{
		Content: response.Choices[0].Message.Content,
		Tokens:  response.Usage.CompletionTokens,
	}

	return result, nil
}

// ProxyCompletions проксирует запрос на завершение текста к LiteLLM API
func (c *liteLLMClient) ProxyCompletions(ctx context.Context, request map[string]interface{}) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/completions", c.baseURL)

	// Преобразуем запрос в JSON
	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("ошибка при сериализации запроса: %w", err)
	}

	// Создаем HTTP запрос
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("ошибка при создании HTTP запроса: %w", err)
	}

	// Устанавливаем заголовки
	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
	}

	// Выполняем запрос
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка при выполнении HTTP запроса: %w", err)
	}
	defer resp.Body.Close()

	// Проверяем статус ответа
	if resp.StatusCode != http.StatusOK {
		var errorResponse map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&errorResponse); err != nil {
			return nil, fmt.Errorf("ошибка статуса %d от LiteLLM API", resp.StatusCode)
		}
		return nil, fmt.Errorf("ошибка от LiteLLM API: %v", errorResponse)
	}

	// Декодируем ответ
	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("ошибка при десериализации ответа: %w", err)
	}

	return response, nil
}
