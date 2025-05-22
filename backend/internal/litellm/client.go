package litellm

import (
	"context"
	"time"

	"github.com/oneaihub/backend/internal/domain"
)

// LiteLLMClient интерфейс для работы с LiteLLM
type LiteLLMClient interface {
	// Получение списка всех доступных моделей
	GetModels(ctx context.Context) ([]domain.Model, error)

	// Получение списка всех компаний-провайдеров
	GetProviders(ctx context.Context) ([]domain.Company, error)

	// Создание ключа API
	CreateKey(ctx context.Context, userId string, expiresAt time.Time) (*domain.ApiKey, error)

	// Проверка доступности кэширования
	IsCachingAvailable(ctx context.Context) (bool, error)

	// Получение информации об использовании
	GetUsage(ctx context.Context, keyId string) (*domain.Usage, error)

	// Проксирование запроса к модели
	ProxyRequest(ctx context.Context, model string, request *domain.Request) (*domain.Response, error)

	// Обработка запросов completions
	ProxyCompletions(ctx context.Context, request map[string]interface{}) (map[string]interface{}, error)
}

// ModelSyncService интерфейс для синхронизации моделей
type ModelSyncService interface {
	// Синхронизирует модели из LiteLLM с локальной БД
	SyncModels(ctx context.Context) error

	// Синхронизирует компании из LiteLLM с локальной БД
	SyncCompanies(ctx context.Context) error
}
