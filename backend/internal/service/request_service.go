package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/repository"
	"oneui-hub/pkg/auth"
)

type RequestService interface {
	// Синхронизация запросов из LiteLLM
	SyncRequestsFromLiteLLM(ctx context.Context, userID string) error
	SyncAllUsersRequests(ctx context.Context) error

	// CRUD операции
	CreateRequest(ctx context.Context, request *domain.Request) error
	GetRequestByID(ctx context.Context, id string) (*domain.Request, error)
	GetRequestsByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Request, error)
	GetRequestsByModelID(ctx context.Context, modelID string, limit, offset int) ([]*domain.Request, error)
	GetAllRequests(ctx context.Context, limit, offset int) ([]*domain.Request, error)

	// Создание запроса из данных LiteLLM
	CreateRequestFromLiteLLM(ctx context.Context, litellmLog map[string]interface{}, userID string) error
}

type requestService struct {
	requestRepo   repository.RequestRepository
	userRepo      repository.UserRepository
	modelRepo     repository.ModelRepository
	apiKeyRepo    repository.ApiKeyRepository
	litellmClient *litellm.Client
}

func NewRequestService(
	requestRepo repository.RequestRepository,
	userRepo repository.UserRepository,
	modelRepo repository.ModelRepository,
	apiKeyRepo repository.ApiKeyRepository,
	litellmClient *litellm.Client,
) RequestService {
	return &requestService{
		requestRepo:   requestRepo,
		userRepo:      userRepo,
		modelRepo:     modelRepo,
		apiKeyRepo:    apiKeyRepo,
		litellmClient: litellmClient,
	}
}

func (s *requestService) CreateRequest(ctx context.Context, request *domain.Request) error {
	if request.ID == "" {
		request.ID = uuid.New().String()
	}
	return s.requestRepo.Create(ctx, request)
}

func (s *requestService) GetRequestByID(ctx context.Context, id string) (*domain.Request, error) {
	return s.requestRepo.GetByID(ctx, id)
}

func (s *requestService) GetRequestsByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Request, error) {
	return s.requestRepo.GetByUserID(ctx, userID, limit, offset)
}

func (s *requestService) GetRequestsByModelID(ctx context.Context, modelID string, limit, offset int) ([]*domain.Request, error) {
	return s.requestRepo.GetByModelID(ctx, modelID, limit, offset)
}

func (s *requestService) GetAllRequests(ctx context.Context, limit, offset int) ([]*domain.Request, error) {
	return s.requestRepo.List(ctx, limit, offset)
}

func (s *requestService) SyncRequestsFromLiteLLM(ctx context.Context, userID string) error {
	// Получаем API ключи пользователя
	apiKeys, err := s.apiKeyRepo.GetByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user API keys: %w", err)
	}

	for _, apiKey := range apiKeys {
		if err := s.syncRequestsForAPIKey(ctx, apiKey, userID); err != nil {
			// Логируем ошибку, но продолжаем обработку других ключей
			fmt.Printf("Warning: failed to sync requests for API key %s: %v\n", apiKey.Name, err)
			continue
		}
	}

	return nil
}

func (s *requestService) SyncAllUsersRequests(ctx context.Context) error {
	// Получаем всех пользователей
	users, err := s.userRepo.List(ctx, 0, 0)
	if err != nil {
		return fmt.Errorf("failed to get users: %w", err)
	}

	for _, user := range users {
		if err := s.SyncRequestsFromLiteLLM(ctx, user.ID); err != nil {
			fmt.Printf("Warning: failed to sync requests for user %s: %v\n", user.Email, err)
			continue
		}
	}

	return nil
}

func (s *requestService) syncRequestsForAPIKey(ctx context.Context, apiKey *domain.ApiKey, userID string) error {
	// Получаем оригинальный ключ для запроса к LiteLLM
	var keyToUse string
	if apiKey.OriginalKey != "" {
		// Расшифровываем ключ
		originalKey, err := auth.DecryptAPIKey(apiKey.OriginalKey)
		if err != nil {
			fmt.Printf("Warning: Failed to decrypt API key %s: %v, trying ExternalID\n", apiKey.Name, err)
			// Если не удалось расшифровать, пробуем ExternalID
			if apiKey.ExternalID != "" {
				keyToUse = apiKey.ExternalID
			} else {
				return fmt.Errorf("no usable key found for API key %s", apiKey.Name)
			}
		} else {
			keyToUse = originalKey
		}
	} else if apiKey.ExternalID != "" {
		keyToUse = apiKey.ExternalID
	} else {
		return fmt.Errorf("no usable key found for API key %s", apiKey.Name)
	}

	// Получаем логи из LiteLLM
	logs, err := s.litellmClient.GetSpendLogsByAPIKey(ctx, keyToUse)
	if err != nil {
		return fmt.Errorf("failed to get spend logs: %w", err)
	}

	// Обрабатываем каждый лог
	for _, log := range logs {
		if err := s.CreateRequestFromLiteLLM(ctx, log, userID); err != nil {
			fmt.Printf("Warning: failed to create request from LiteLLM log: %v\n", err)
			continue
		}
	}

	return nil
}

func (s *requestService) CreateRequestFromLiteLLM(ctx context.Context, litellmLog map[string]interface{}, userID string) error {
	// Извлекаем ID запроса
	requestID, ok := litellmLog["request_id"].(string)
	if !ok || requestID == "" {
		return fmt.Errorf("invalid request_id in log")
	}

	// Проверяем, есть ли уже такой запрос в БД
	existingRequests, err := s.requestRepo.GetByUserID(ctx, userID, 0, 0)
	if err == nil {
		for _, req := range existingRequests {
			if req.ExternalRequestID != nil && *req.ExternalRequestID == requestID {
				// Запрос уже существует
				return nil
			}
		}
	}

	// Извлекаем данные из лога
	modelName, _ := litellmLog["model"].(string)
	provider, _ := litellmLog["custom_llm_provider"].(string)
	callType, _ := litellmLog["call_type"].(string)

	// Токены
	inputTokens := s.extractIntFromLog(litellmLog, "prompt_tokens")
	outputTokens := s.extractIntFromLog(litellmLog, "completion_tokens")
	totalTokens := s.extractIntFromLog(litellmLog, "total_tokens")

	// Если не удалось извлечь отдельно input/output, используем total
	if inputTokens == 0 && outputTokens == 0 && totalTokens > 0 {
		inputTokens = totalTokens / 2 // Приблизительное разделение
		outputTokens = totalTokens / 2
	}

	// Стоимость
	totalCost := s.extractFloatFromLog(litellmLog, "spend")
	inputCost := totalCost * 0.6 // Приблизительное разделение
	outputCost := totalCost * 0.4

	// Времена
	startTime := s.extractTimeFromLog(litellmLog, "startTime")
	endTime := s.extractTimeFromLog(litellmLog, "endTime")

	// Найдем модель в БД по имени
	var modelID string
	if modelName != "" {
		if model, err := s.modelRepo.GetByExternalID(ctx, modelName); err == nil {
			modelID = model.ID
		}
	}

	// Найдем API ключ
	var apiKeyID *string
	if apiKeyStr, ok := litellmLog["api_key"].(string); ok && apiKeyStr != "" {
		if apiKeys, err := s.apiKeyRepo.GetByUserID(ctx, userID); err == nil {
			for _, key := range apiKeys {
				// Простое сравнение с OriginalKey или ExternalID
				if (key.OriginalKey != "" && key.OriginalKey == apiKeyStr) ||
					(key.ExternalID != "" && key.ExternalID == apiKeyStr) {
					apiKeyID = &key.ID
					break
				}
			}
		}
	}

	// Создаем запрос
	request := &domain.Request{
		ID:                uuid.New().String(),
		UserID:            userID,
		ModelID:           modelID,
		ApiKeyID:          apiKeyID,
		ExternalRequestID: &requestID,
		InputTokens:       inputTokens,
		OutputTokens:      outputTokens,
		InputCost:         inputCost,
		OutputCost:        outputCost,
		TotalCost:         totalCost,
		Status:            "completed",
		CallType:          &callType,
		ModelName:         &modelName,
		Provider:          &provider,
		StartTime:         startTime,
		EndTime:           endTime,
		CreatedAt:         time.Now(),
	}

	return s.requestRepo.Create(ctx, request)
}

// Вспомогательные функции для извлечения данных из лога
func (s *requestService) extractIntFromLog(log map[string]interface{}, key string) int {
	if val, ok := log[key]; ok {
		switch v := val.(type) {
		case int:
			return v
		case float64:
			return int(v)
		case string:
			// Можно добавить парсинг строки в int
		}
	}
	return 0
}

func (s *requestService) extractFloatFromLog(log map[string]interface{}, key string) float64 {
	if val, ok := log[key]; ok {
		switch v := val.(type) {
		case float64:
			return v
		case int:
			return float64(v)
		case string:
			// Можно добавить парсинг строки в float64
		}
	}
	return 0.0
}

func (s *requestService) extractTimeFromLog(log map[string]interface{}, key string) *time.Time {
	if val, ok := log[key]; ok {
		if timeStr, ok := val.(string); ok && timeStr != "" {
			if parsedTime, err := time.Parse(time.RFC3339, timeStr); err == nil {
				return &parsedTime
			}
			// Попробуем другие форматы времени
			if parsedTime, err := time.Parse("2006-01-02T15:04:05.000Z", timeStr); err == nil {
				return &parsedTime
			}
		}
	}
	return nil
}
