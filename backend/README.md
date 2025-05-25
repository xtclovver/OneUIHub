# OneUIHub Backend

Бэкенд для OneUIHub - платформы управления AI моделями через LiteLLM.

## Возможности

- 🔐 Аутентификация и авторизация пользователей
- 👥 Управление пользователями и ролями
- 🏢 Управление компаниями и AI моделями
- 💰 Система тарифов и лимитов
- 🔑 Управление API ключами
- 📊 Отслеживание использования и затрат
- 🚀 Интеграция с LiteLLM

## Технологии

- **Go 1.21** - основной язык
- **Gin** - веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **MySQL** - база данных
- **JWT** - аутентификация
- **LiteLLM** - прокси для AI моделей

## Быстрый старт

### Предварительные требования

- Go 1.21+
- MySQL 8.0+
- LiteLLM сервер (опционально)

### Установка

1. Клонируйте репозиторий:
\`\`\`bash
git clone <repository-url>
cd OneUIHub/backend
\`\`\`

2. Установите зависимости:
\`\`\`bash
go mod tidy
\`\`\`

3. Скопируйте и настройте конфигурацию:
\`\`\`bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
\`\`\`

4. Создайте базу данных MySQL:
\`\`\`sql
CREATE DATABASE oneui_hub;
\`\`\`

5. Запустите сервер:
\`\`\`bash
go run cmd/server/main.go
\`\`\`

Сервер будет доступен по адресу \`http://localhost:8080\`

## API Документация

### Аутентификация

#### Регистрация
\`\`\`
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "tier_name": "free"
}
\`\`\`

#### Вход
\`\`\`
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

#### Обновление токена
\`\`\`
POST /api/v1/auth/refresh
Authorization: Bearer <token>
\`\`\`

#### Получение профиля
\`\`\`
GET /api/v1/me
Authorization: Bearer <token>
\`\`\`

## Структура проекта

\`\`\`
backend/
├── cmd/
│   └── server/          # Точка входа приложения
├── internal/
│   ├── api/
│   │   ├── handlers/    # HTTP обработчики
│   │   └── routes/      # Маршруты API
│   ├── config/          # Конфигурация
│   ├── domain/          # Модели предметной области
│   ├── litellm/         # Интеграция с LiteLLM
│   ├── middleware/      # HTTP middleware
│   ├── repository/      # Слой доступа к данным
│   └── service/         # Бизнес-логика
├── pkg/
│   ├── auth/           # Утилиты аутентификации
│   ├── database/       # Подключение к БД
│   └── utils/          # Общие утилиты
└── scripts/
    └── migrations/     # Миграции БД
\`\`\`

## Конфигурация

Все настройки задаются через переменные окружения или .env файл:

- \`SERVER_HOST\` - хост сервера (по умолчанию: localhost)
- \`SERVER_PORT\` - порт сервера (по умолчанию: 8080)
- \`DB_HOST\` - хост MySQL
- \`DB_PORT\` - порт MySQL
- \`DB_USER\` - пользователь MySQL
- \`DB_PASSWORD\` - пароль MySQL
- \`DB_NAME\` - имя базы данных
- \`JWT_SECRET\` - секретный ключ для JWT
- \`TOKEN_DURATION\` - время жизни токена
- \`LITELLM_BASE_URL\` - URL LiteLLM сервера
- \`LITELLM_API_KEY\` - API ключ LiteLLM

## Разработка

### Запуск в режиме разработки

\`\`\`bash
go run cmd/server/main.go
\`\`\`

### Тестирование

\`\`\`bash
go test ./...
\`\`\`

### Сборка

\`\`\`bash
go build -o bin/server cmd/server/main.go
\`\`\`

## Лицензия

MIT 