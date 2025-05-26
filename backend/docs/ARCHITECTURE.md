# Архитектура OneUIHub Backend

## Обзор

OneUIHub Backend построен на основе чистой архитектуры (Clean Architecture) с использованием Go и следует принципам SOLID. Приложение разделено на слои с четкими границами и зависимостями.

## Структура проекта

```
backend/
├── cmd/
│   └── server/              # Точка входа приложения
│       └── main.go         # Основной файл сервера
├── internal/               # Внутренние пакеты приложения
│   ├── api/               # HTTP слой
│   │   ├── handlers/      # HTTP обработчики
│   │   └── routes/        # Маршруты API
│   ├── config/            # Конфигурация приложения
│   ├── domain/            # Модели предметной области
│   ├── litellm/           # Интеграция с LiteLLM
│   ├── middleware/        # HTTP middleware
│   ├── repository/        # Слой доступа к данным
│   └── service/           # Бизнес-логика
├── pkg/                   # Переиспользуемые пакеты
│   ├── auth/             # Утилиты аутентификации
│   ├── database/         # Подключение к БД
│   └── utils/            # Общие утилиты
└── scripts/              # Скрипты и миграции
    └── migrations/       # SQL миграции
```

## Слои архитектуры

### 1. Domain Layer (internal/domain/)
Содержит модели предметной области и бизнес-правила:
- `User` - пользователи системы
- `Tier` - тарифные планы
- `Company` - компании-провайдеры AI
- `Model` - AI модели
- `ApiKey` - API ключи
- `Request` - запросы к моделям
- `RateLimit` - ограничения скорости

### 2. Repository Layer (internal/repository/)
Слой доступа к данным с интерфейсами и реализациями:
- Абстракция работы с базой данных
- CRUD операции для всех сущностей
- Использование GORM для ORM

### 3. Service Layer (internal/service/)
Бизнес-логика приложения:
- `UserService` - управление пользователями
- Валидация данных
- Бизнес-правила и ограничения

### 4. API Layer (internal/api/)
HTTP слой приложения:
- **Handlers** - обработка HTTP запросов
- **Routes** - маршрутизация
- **Middleware** - промежуточное ПО

### 5. Infrastructure Layer (pkg/)
Инфраструктурные компоненты:
- **Database** - подключение к БД
- **Auth** - JWT аутентификация
- **Utils** - вспомогательные функции

## Технологический стек

### Основные технологии
- **Go 1.21** - основной язык программирования
- **Gin** - HTTP веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **MySQL** - реляционная база данных
- **JWT** - токены для аутентификации

### Дополнительные инструменты
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация контейнеров
- **Make** - автоматизация задач
- **Air** - hot reload для разработки

## Паттерны проектирования

### 1. Repository Pattern
Абстракция доступа к данным через интерфейсы:
```go
type UserRepository interface {
    Create(ctx context.Context, user *domain.User) error
    GetByID(ctx context.Context, id string) (*domain.User, error)
    // ...
}
```

### 2. Dependency Injection
Внедрение зависимостей через конструкторы:
```go
func NewUserService(
    userRepo repository.UserRepository,
    userLimitRepo repository.UserLimitRepository,
    tierRepo repository.TierRepository,
) *UserService
```

### 3. Middleware Pattern
Цепочка обработчиков для HTTP запросов:
```go
protected.Use(authMiddleware.RequireAuth())
admin.Use(authMiddleware.RequireAdmin())
```

## Безопасность

### Аутентификация
- JWT токены с подписью HMAC
- Refresh токены для обновления
- Middleware для проверки токенов

### Авторизация
- Ролевая модель (customer, enterprise, support, admin)
- Проверка прав доступа на уровне middleware
- Защита административных эндпоинтов

### Валидация
- Валидация входных данных на уровне handlers
- Санитизация пользовательского ввода
- Проверка бизнес-правил в services

## Конфигурация

Конфигурация через переменные окружения:
- Настройки сервера (хост, порт)
- Подключение к базе данных
- JWT секреты
- Настройки LiteLLM

## Мониторинг и логирование

### Health Checks
- Endpoint `/health` для проверки состояния
- Проверка подключения к БД
- Docker health checks

### Логирование
- Структурированные логи
- Логирование ошибок и важных событий
- Контекстная информация в логах

## Развертывание

### Docker
- Многоэтапная сборка для оптимизации
- Минимальный образ на основе scratch
- Непривилегированный пользователь

### Docker Compose
- Полная среда разработки
- MySQL, Redis, LiteLLM
- Автоматическая инициализация данных

## Тестирование

### Структура тестов
- Unit тесты для services
- Integration тесты для repositories
- API тесты для handlers

### Покрытие кода
- Цель: >80% покрытия
- Автоматические отчеты
- CI/CD интеграция

## Производительность

### Оптимизации
- Подготовленные SQL запросы
- Индексы базы данных
- Кэширование (Redis)
- Connection pooling

### Масштабирование
- Stateless архитектура
- Горизонтальное масштабирование
- Load balancing готовность

## Будущие улучшения

1. **Кэширование** - Redis для кэширования частых запросов
2. **Метрики** - Prometheus/Grafana для мониторинга
3. **Трейсинг** - Jaeger для распределенного трейсинга
4. **Rate Limiting** - Защита от злоупотреблений
5. **API Versioning** - Версионирование API
6. **GraphQL** - Альтернативный API интерфейс 