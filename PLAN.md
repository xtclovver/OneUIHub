# Инструкция по разработке "OneAI Hub"

## Общая архитектура
- Фронтенд: React, TypeScript, Redux для управления состоянием
- Бэкенд: Go с соблюдением принципов SOLID
- БД: MySQL 
- LiteLLM: Получение списка моделей, управление API ключами, кэширование и совместимость с OpenAI API
- Запрещено писать мок сервисы, заглушки и плейсхолдеры, не важно как они называются. Пиши полный код, если понадобится контекст файла то его можно запросить
## Структура проекта 

### Внешний вид
Сайт должен быть адаптирован для мобильных версий.
Внешний вид сайта должен быть в стиле сайта anthropic, но адаптированный под текущий проект. 
Но нужно тоже привнести слегка своё.
Нужно взять градиент приятный глазу. Сайт должен иметь интуитивно понятный и приятный интерфейс.
Сайт должен иметь красивые и плавные анимации. 
Фон должен быть серо-черного цвета и иметь красивые паттерны в виде фигур. Где-то использовать ситуативно определенные паттерны. Например на страницах компаний, например Anthropic, может быть быть паттерн на заднем фоне в виде логотипа компинии и так далее. 
Добавляй изюминки от себя, то что я здесь не упомянул, но это стоит добавить то тоже добавляй.

### Бэкенд (Go)
```
backend/
  ├── cmd/              # Точки входа приложения
  │   └── server/       # HTTP сервер
  ├── internal/         # Внутренний код приложения
  │   ├── api/          # API обработчики
  │   ├── config/       # Конфигурация
  │   ├── domain/       # Модели предметной области
  │   ├── repository/   # Слой доступа к БД
  │   ├── service/      # Бизнес-логика
  │   ├── middleware/   # Промежуточное ПО
  │   └── litellm/      # Интеграция с LiteLLM
  ├── pkg/              # Публичные пакеты
  └── scripts/          # Скрипты для миграций и т.д.
```

### Фронтенд (React)
```
frontend/
  ├── public/           # Статичные файлы
  ├── src/              # Исходный код
  │   ├── api/          # API клиент
  │   ├── components/   # React компоненты
  │   │   ├── common/   # Общие компоненты
  │   │   ├── admin/    # Компоненты админки
  │   │   ├── user/     # Компоненты пользователя
  │   │   └── models/   # Компоненты для моделей
  │   ├── pages/        # Страницы приложения
  │   │   ├── Home/     # Главная страница
  │   │   ├── Models/   # Страница моделей
  │   │   ├── Company/  # Страница компании с моделями
  │   │   ├── Profile/  # Профиль пользователя
  │   │   └── Requests/ # Страница запросов пользователя
  │   ├── redux/        # Хранилище состояния
  │   ├── types/        # TypeScript типы
  │   └── utils/        # Утилиты
  └── tests/            # Тесты
```

## Бэкенд (Go)

### Модели данных (дополненные)
1. User - данные пользователя, включая auth, tier
2. Company - компания-провайдер моделей (получается из LiteLLM API)
3. Model - модель ИИ (базовая информация получается из LiteLLM API)
4. ModelConfig - настройки модели, устанавливаемые администратором
5. Tier - тир подписки с разными лимитами
6. RateLimit - ограничения запросов для каждой модели по тирам
7. ApiKey - ключи API и их привязка к пользователям
8. Request - история запросов пользователя с токенами и стоимостью
9. Usage - учёт использования (для биллинга)

### Расширенная интеграция с LiteLLM
```go
// Пример интерфейса для работы с LiteLLM
type LiteLLMClient interface {
    // Получение списка всех доступных моделей
    GetModels(ctx context.Context) ([]Model, error)
    
    // Получение списка всех компаний-провайдеров
    GetProviders(ctx context.Context) ([]Company, error)
    
    // Создание ключа API
    CreateKey(ctx context.Context, userId string, expiresAt time.Time) (*ApiKey, error)
    
    // Проверка доступности кэширования
    IsCachingAvailable(ctx context.Context) (bool, error)
    
    // Получение информации об использовании
    GetUsage(ctx context.Context, keyId string) (*Usage, error)
    
    // Проксирование запроса к модели
    ProxyRequest(ctx context.Context, model string, request *Request) (*Response, error)
}

// Имплементация для синхронизации моделей
type ModelSyncService interface {
    // Синхронизирует модели из LiteLLM с локальной БД
    SyncModels(ctx context.Context) error
    
    // Синхронизирует компании из LiteLLM с локальной БД
    SyncCompanies(ctx context.Context) error
}
```

### API Endpoints (обновленные)

#### Публичные
- `GET /api/companies` - список компаний-провайдеров (из LiteLLM)
- `GET /api/companies/{id}/models` - список моделей компании
- `GET /api/models` - получение списка всех моделей
- `GET /api/models/{id}` - детали конкретной модели
- `GET /api/tiers` - доступные тиры подписки
- `GET /api/rate-limits` - лимиты запросов для моделей по тирам
- `GET /api/docs` - документация API

#### Пользовательские (требуют авторизации)
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/profile` - данные профиля
- `GET /api/profile/limits` - текущие лимиты/баланс
- `GET /api/requests` - история запросов пользователя
- `POST /api/keys` - создание API ключа
- `GET /api/keys` - получение ключей пользователя

#### Административные
- `GET /api/admin/users` - список пользователей
- `POST/PUT/DELETE /api/admin/users` - управление пользователями
- `GET /api/admin/models` - список моделей
- `POST/PUT/DELETE /api/admin/model-configs` - управление настройками моделей
- `GET /api/admin/tiers` - список тиров
- `POST/PUT/DELETE /api/admin/tiers` - управление тирами
- `GET /api/admin/rate-limits` - лимиты запросов
- `POST/PUT/DELETE /api/admin/rate-limits` - управление лимитами
- `POST /api/admin/approve/{userId}` - одобрение бесплатного ранга
- `POST /api/admin/sync/models` - синхронизация моделей с LiteLLM
- `POST /api/admin/sync/companies` - синхронизация компаний с LiteLLM

## Фронтенд (React)

### Основные страницы
1. Главная страница
   - Список компаний-провайдеров
   - Общая информация о сервисе

2. Страница компании
   - Список моделей конкретной компании
   - Информация о каждой модели, включая лимиты по тирам

3. Страница модели
   - Детальная информация о модели
   - Таблица лимитов по тирам для этой модели

4. Страница документации
   - API документация
   - Примеры использования

5. Панель пользователя
   - Профиль
   - Лимиты и баланс
   - Управление API ключами

6. Страница запросов пользователя
   - Таблица с историей запросов
   - Информация о входных/выходных токенах и их стоимости
   - Переключатель для отображения разбивки стоимости

7. Административная панель
   - Синхронизация моделей с LiteLLM
   - Настройка параметров моделей (стоимость входных/выходных токенов)
   - Управление тирами и лимитами
   - Управление пользователями
   - Одобрение запросов на бесплатный ранг

### Компоненты (дополненные)
1. CompanyCard - карточка компании
2. CompanyList - список компаний
3. ModelCard - карточка модели
4. ModelList - список моделей с фильтрацией/сортировкой
5. ModelConfigForm - форма настройки параметров модели
6. RateLimitTable - таблица лимитов по тирам
7. RequestsTable - таблица запросов с переключателем разбивки стоимости
8. ApiKeyManager - управление API ключами
9. LimitsDisplay - отображение лимитов/баланса
10. AdminModelConfigForm - форма для настройки моделей
11. AdminRateLimitForm - форма для управления лимитами
12. AdminUserManager - управление пользователями
13. SyncButton - кнопка для синхронизации моделей/компаний с LiteLLM

## База данных (MySQL)

### Обновленная схема данных
```sql
-- Создание таблицы тарифов (должна быть первой, так как на неё ссылаются пользователи)
CREATE TABLE tiers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы компаний (должна быть перед моделями)
CREATE TABLE companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  description TEXT,
  external_id VARCHAR(255) UNIQUE,  -- ID в системе LiteLLM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы пользователей (после тарифов)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  role ENUM('customer', 'enterprise', 'support', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES tiers(id)
);

-- Создание таблицы трат пользователей (для автоматического повышения тарифа)
CREATE TABLE user_spendings (
  user_id VARCHAR(36) PRIMARY KEY,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы моделей (после компаний)
CREATE TABLE models (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  features TEXT,
  external_id VARCHAR(255) UNIQUE,  -- ID в системе LiteLLM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Создание таблицы конфигураций моделей (после моделей)
CREATE TABLE model_configs (
  id VARCHAR(36) PRIMARY KEY,
  model_id VARCHAR(36) NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  is_enabled BOOLEAN DEFAULT TRUE,
  input_token_cost DECIMAL(10, 6),
  output_token_cost DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Создание таблицы лимитов (после моделей и тарифов)
CREATE TABLE rate_limits (
  id VARCHAR(36) PRIMARY KEY,
  model_id VARCHAR(36) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  requests_per_minute INT DEFAULT 0,
  requests_per_day INT DEFAULT 0,
  tokens_per_minute INT DEFAULT 0,
  tokens_per_day INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_model_tier (model_id, tier_id)
);

-- Создание таблицы API ключей (после пользователей)
CREATE TABLE api_keys (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  external_id VARCHAR(255),  -- ID в системе LiteLLM
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы запросов (после пользователей и моделей)
CREATE TABLE requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  model_id VARCHAR(36) NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  input_cost DECIMAL(10, 6) NOT NULL,
  output_cost DECIMAL(10, 6) NOT NULL,
  total_cost DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Создание таблицы лимитов пользователей (после пользователей)
CREATE TABLE user_limits (
  user_id VARCHAR(36) PRIMARY KEY,
  monthly_token_limit BIGINT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Таблица ограничений Rate Limits по тирам

| Тир       | Модель           | Запросов/мин | Запросов/день | Токенов/мин | Токенов/день |
|-----------|------------------|--------------|---------------|-------------|--------------|
| Free      | Claude 3 Haiku   | 5            | 100           | 10,000      | 100,000      |
| Free      | GPT-3.5 Turbo    | 5            | 100           | 10,000      | 100,000      |
| Free      | Mistral Small    | 10           | 200           | 15,000      | 150,000      |
| Starter   | Claude 3.5 Sonnet| 10           | 300           | 20,000      | 300,000      |
| Starter   | GPT-4o           | 10           | 200           | 20,000      | 200,000      |
| Starter   | Mistral Medium   | 15           | 400           | 30,000      | 400,000      |
| Pro       | Claude 3.5 Sonnet| 30           | 1,000         | 100,000     | 1,000,000    |
| Pro       | Claude 3.7 Sonnet| 20           | 500           | 60,000      | 600,000      |
| Pro       | GPT-4o           | 30           | 1,000         | 100,000     | 1,000,000    |
| Pro       | GPT-4 Turbo      | 20           | 500           | 60,000      | 600,000      |
| Enterprise| Claude 3.7 Sonnet| 60           | 2,000         | 200,000     | 5,000,000    |
| Enterprise| GPT-4 Turbo      | 60           | 2,000         | 200,000     | 5,000,000    |
| Enterprise| Claude 3 Opus    | 30           | 1,000         | 100,000     | 2,000,000    |

## Процесс синхронизации моделей с LiteLLM

1. Администратор запускает синхронизацию через API или административную панель
2. Система запрашивает список моделей и компаний из LiteLLM API
3. Для новых моделей и компаний создаются записи в БД
4. Для существующих моделей обновляется базовая информация
5. Настройки, установленные администратором (стоимость токенов, лимиты), сохраняются

```go
// Пример сервиса синхронизации
func (s *modelSyncService) SyncModels(ctx context.Context) error {
    // Получение моделей из LiteLLM
    litellmModels, err := s.litellmClient.GetModels(ctx)
    if err != nil {
        return fmt.Errorf("failed to fetch models from LiteLLM: %w", err)
    }
    
    // Синхронизация каждой модели
    for _, litellmModel := range litellmModels {
        // Поиск модели в БД по external_id
        model, err := s.modelRepo.FindByExternalID(ctx, litellmModel.ID)
        if err != nil && !errors.Is(err, sql.ErrNoRows) {
            return fmt.Errorf("failed to check model existence: %w", err)
        }
        
        // Если модель не существует, создаем новую
        if errors.Is(err, sql.ErrNoRows) {
            // Поиск или создание компании
            company, err := s.ensureCompanyExists(ctx, litellmModel.Provider)
            if err != nil {
                return fmt.Errorf("failed to ensure company exists: %w", err)
            }
            
            // Создание новой модели
            newModel := &domain.Model{
                ID:         uuid.New().String(),
                CompanyID:  company.ID,
                Name:       litellmModel.Name,
                ExternalID: litellmModel.ID,
                // Другие поля...
            }
            
            if err := s.modelRepo.Create(ctx, newModel); err != nil {
                return fmt.Errorf("failed to create model: %w", err)
            }
            
            // Создание базовой конфигурации модели
            defaultConfig := &domain.ModelConfig{
                ID:              uuid.New().String(),
                ModelID:         newModel.ID,
                IsEnabled:       true,
                InputTokenCost:  0, // Настраивается администратором
                OutputTokenCost: 0, // Настраивается администратором
            }
            
            if err := s.modelConfigRepo.Create(ctx, defaultConfig); err != nil {
                return fmt.Errorf("failed to create model config: %w", err)
            }
        } else {
            // Обновляем существующую модель
            model.Name = litellmModel.Name
            // Обновление других полей...
            
            if err := s.modelRepo.Update(ctx, model); err != nil {
                return fmt.Errorf("failed to update model: %w", err)
            }
        }
    }
    
    return nil
}
```

## Методы LiteLLM для интеграции

### Управление моделями
- `GET /models` - получение списка всех доступных моделей
- `GET /model/info` - получение детальной информации о модели
- `GET /model_group/info` - информация о группе моделей

### Запросы к моделям
- `POST /chat/completions` - отправка запроса чата к модели
- `POST /completions` - отправка запроса на завершение текста
- `POST /embeddings` - получение эмбеддингов
- `POST /utils/token_counter` - подсчет токенов

### Управление ключами
- `POST /key/generate` - генерация API ключа
- `POST /key/update` - обновление API ключа
- `GET /key/info` - информация о ключе
- `POST /key/delete` - удаление ключа
- `GET /key/list` - список ключей

### Отслеживание расходов
- `GET /spend/logs` - просмотр логов расходов
- `POST /spend/calculate` - расчет расходов
- `GET /spend/tags` - просмотр тегов расходов

## Необходимые методы LiteLLM API для интеграции

### Управление моделями
- `GET /models` - получение списка всех доступных моделей
- `GET /model/info` - получение детальной информации о модели
- `GET /model_group/info` - информация о группе моделей
- `POST /model/update` - обновление параметров модели

### Запросы к моделям
- `POST /chat/completions` - отправка запроса чата к модели
- `POST /completions` - отправка запроса на завершение текста
- `POST /embeddings` - получение эмбеддингов
- `POST /utils/token_counter` - подсчет токенов

### Управление ключами
- `POST /key/generate` - генерация API ключа
- `POST /key/update` - обновление API ключа
- `GET /key/info` - информация о ключе
- `POST /key/delete` - удаление ключа
- `GET /key/list` - список ключей

### Отслеживание расходов
- `GET /spend/logs` - просмотр логов расходов
- `POST /spend/calculate` - расчет расходов
- `GET /spend/tags` - просмотр тегов расходов
- `GET /global/spend/report` - получение глобального отчета о расходах

## Обновленный план имплементации с учетом LiteLLM
1. Настройка проекта и репозитория
2. Создание базовых моделей и миграций БД
3. Разработка интеграции с LiteLLM
   - Получение списка моделей и компаний
   - Реализация процесса синхронизации
   - Управление API ключами
   - Отслеживание токенов и стоимости
4. Разработка ключевых API эндпоинтов
5. Разработка админ-панели с настройкой параметров моделей
6. Имплементация системы тиров и ограничений
7. Разработка функционала отслеживания запросов
8. Разработка основных страниц фронтенда
   - Главная страница с компаниями
   - Страница моделей по компаниям
   - Страница запросов с переключателем стоимости
   - Административная панель с синхронизацией моделей
9. Тестирование и отладка