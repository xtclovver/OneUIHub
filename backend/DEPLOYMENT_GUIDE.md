# Руководство по развертыванию OneUIHub Backend

## Предварительные требования

1. **Go 1.21+** - для компиляции и запуска приложения
2. **MySQL 8.0+** - база данных
3. **LiteLLM сервер** - должен быть запущен на localhost:4000
4. **Git** - для клонирования репозитория

## Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd OneUIHub/backend
```

### 2. Установка зависимостей

```bash
go mod download
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне директории backend:

```env
# Сервер
SERVER_HOST=localhost
SERVER_PORT=8080

# База данных
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=oneui_hub

# Аутентификация
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TOKEN_DURATION=24h

# LiteLLM
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=sk-SZQ85Nd1gd0gkzIbjbAajg
LITELLM_TIMEOUT=30s
```

### 4. Настройка базы данных

Создайте базу данных MySQL:

```sql
CREATE DATABASE oneui_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Запуск LiteLLM сервера

Убедитесь, что LiteLLM сервер запущен на порту 4000:

```bash
# Пример запуска LiteLLM (зависит от вашей конфигурации)
litellm --config config.yaml --port 4000
```

### 6. Тестирование интеграции

Запустите тестовый скрипт для проверки подключения к LiteLLM:

```bash
go run test_litellm.go
```

Ожидаемый вывод:
```
=== Тестирование интеграции с LiteLLM ===

1. Получение списка моделей...
Найдено X моделей:
  - model-name (владелец: provider)
  ...

=== Тестирование завершено ===
```

### 7. Запуск приложения

```bash
go run cmd/server/main.go
```

Или скомпилируйте и запустите:

```bash
go build -o oneui-hub cmd/server/main.go
./oneui-hub
```

## Проверка работоспособности

### Health Check

```bash
curl http://localhost:8080/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "service": "oneui-hub-backend"
}
```

### Тестирование API моделей

```bash
# Получение моделей из LiteLLM (требует аутентификации)
curl -X GET http://localhost:8080/api/v1/admin/models/litellm \
  -H "Authorization: Bearer your-jwt-token"
```

## Структура проекта

```
backend/
├── cmd/
│   └── server/          # Точка входа приложения
├── internal/
│   ├── api/
│   │   ├── handlers/    # HTTP хендлеры
│   │   └── routes/      # Маршруты API
│   │
│   ├── config/          # Конфигурация
│   ├── domain/          # Модели данных
│   ├── litellm/         # Интеграция с LiteLLM
│   ├── middleware/      # Middleware
│   ├── repository/      # Слой данных
│   └── service/         # Бизнес-логика
├── pkg/                 # Общие пакеты
└── scripts/             # Скрипты миграций
```

## Основные функции

### Управление моделями

1. **Синхронизация с LiteLLM**: `POST /admin/models/sync`
2. **Получение моделей**: `GET /admin/models/litellm`
3. **Управление моделями в БД**: CRUD операции через `/admin/models`

### Управление бюджетами

1. **Синхронизация с LiteLLM**: `POST /admin/budgets/sync`
2. **Получение бюджетов**: `GET /admin/budgets/litellm`
3. **Управление бюджетами в БД**: CRUD операции через `/admin/budgets`

## Безопасность

1. **JWT аутентификация** - все защищенные эндпоинты требуют валидный токен
2. **Роли пользователей** - административные функции доступны только администраторам
3. **CORS** - настроен для работы с фронтендом
4. **Валидация данных** - все входящие данные валидируются

## Мониторинг и логирование

- Все ошибки логируются в консоль
- Health check эндпоинт для мониторинга
- Структурированное логирование запросов

## Troubleshooting

### Ошибка подключения к LiteLLM

```
failed to get models from LiteLLM: failed to execute request
```

**Решение:**
1. Проверьте, что LiteLLM сервер запущен на localhost:4000
2. Убедитесь, что API ключ корректный
3. Проверьте сетевое подключение

### Ошибка подключения к базе данных

```
failed to connect to database
```

**Решение:**
1. Проверьте настройки подключения в .env файле
2. Убедитесь, что MySQL сервер запущен
3. Проверьте права доступа пользователя к базе данных

### Ошибки аутентификации

```
Authorization header required
```

**Решение:**
1. Убедитесь, что JWT токен передается в заголовке Authorization
2. Проверьте формат: `Bearer <token>`
3. Убедитесь, что токен не истек

## Производственное развертывание

### Рекомендации для production

1. **Используйте HTTPS** для всех соединений
2. **Настройте reverse proxy** (nginx/apache)
3. **Используйте переменные окружения** вместо .env файла
4. **Настройте мониторинг** и алерты
5. **Регулярно обновляйте зависимости**
6. **Настройте backup базы данных**

### Docker развертывание

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o oneui-hub cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/oneui-hub .
CMD ["./oneui-hub"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mysql
      - LITELLM_BASE_URL=http://litellm:4000
    depends_on:
      - mysql
      - litellm
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: oneui_hub
    volumes:
      - mysql_data:/var/lib/mysql
  
  litellm:
    image: litellm/litellm:latest
    ports:
      - "4000:4000"

volumes:
  mysql_data:
```

## Поддержка

Для получения помощи:
1. Проверьте документацию API в `API_DOCUMENTATION.md`
2. Изучите логи приложения
3. Создайте issue в репозитории проекта 