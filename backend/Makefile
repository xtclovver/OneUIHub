.PHONY: build run test clean deps migrate init-data test-all test-unit test-integration test-auth test-config test-db test-repo test-service test-handler

BINARY_NAME=oneui-hub-server
BUILD_DIR=bin
MAIN_PATH=cmd/server/main.go

# Go команды
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Цвета для вывода
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

build:
	@echo "$(GREEN)Сборка приложения...$(NC)"
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)Сборка завершена: $(BUILD_DIR)/$(BINARY_NAME)$(NC)"

run:
	@echo "Starting server..."
	@go run $(MAIN_PATH)

# Запуск в режиме разработки с автоперезагрузкой
dev:
	@echo "$(GREEN)Запуск в режиме разработки...$(NC)"
	@air -c .air.toml

deps:
	@echo "$(GREEN)Установка зависимостей...$(NC)"
	$(GOMOD) download
	$(GOMOD) tidy
	@echo "Installing dependencies..."
	@go mod tidy
	@go mod download

test:
	@echo "Running tests..."
	@go test -v ./...

# Запуск всех тестов
test-all:
	@echo "$(GREEN)Запуск всех тестов...$(NC)"
	@chmod +x test_runner.sh
	@./test_runner.sh

# Unit тесты
test-unit:
	@echo "$(GREEN)Запуск unit тестов...$(NC)"
	@go test -v ./internal/config/... ./pkg/auth/... ./pkg/database/... ./internal/repository/... ./internal/service/...

# Интеграционные тесты
test-integration:
	@echo "$(GREEN)Запуск интеграционных тестов...$(NC)"
	@go test -v -run TestIntegration ./...

# Тесты аутентификации
test-auth:
	@echo "$(GREEN)Запуск тестов аутентификации...$(NC)"
	@go test -v ./pkg/auth/...

# Тесты конфигурации
test-config:
	@echo "$(GREEN)Запуск тестов конфигурации...$(NC)"
	@go test -v ./internal/config/...

# Тесты базы данных
test-db:
	@echo "$(GREEN)Запуск тестов базы данных...$(NC)"
	@go test -v ./pkg/database/...

# Тесты репозиториев
test-repo:
	@echo "$(GREEN)Запуск тестов репозиториев...$(NC)"
	@go test -v ./internal/repository/...

# Тесты сервисов
test-service:
	@echo "$(GREEN)Запуск тестов сервисов...$(NC)"
	@go test -v ./internal/service/...

# Тесты хендлеров
test-handler:
	@echo "$(GREEN)Запуск тестов хендлеров...$(NC)"
	@go test -v ./internal/api/handlers/...

# Тестирование с покрытием
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html

lint:
	@echo "Running linter..."
	@golangci-lint run

fmt:
	@echo "Formatting code..."
	@go fmt ./...

clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html

$(BUILD_DIR):
	@mkdir -p $(BUILD_DIR)

build-prod: $(BUILD_DIR)
	@echo "Building for production..."
	@CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)

docker-build:
	@echo "Building Docker image..."
	@docker build -t oneui-hub-backend .

docker-run:
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env oneui-hub-backend

db-create:
	@echo "Creating database..."
	@mysql -u$(DB_USER) -p$(DB_PASSWORD) -h$(DB_HOST) -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME);"

db-drop:
	@echo "Dropping database..."
	@mysql -u$(DB_USER) -p$(DB_PASSWORD) -h$(DB_HOST) -e "DROP DATABASE IF EXISTS $(DB_NAME);"

db-reset: db-drop db-create
	@echo "Database reset complete"

init-data:
	@echo "Initializing base data..."
	@mysql -u$(DB_USER) -p$(DB_PASSWORD) -h$(DB_HOST) $(DB_NAME) < scripts/init_data.sql
	@echo "Base data initialized"

setup: deps db-create init-data
	@echo "Development setup complete"

help:
	@echo "Available commands:"
	@echo "  build        - Build the application"
	@echo "  run          - Run the application"
	@echo "  dev          - Run in development mode with auto-reload"
	@echo "  deps         - Install dependencies"
	@echo "  test         - Run tests"
	@echo "  test-all     - Run all tests with detailed output"
	@echo "  test-unit    - Run unit tests only"
	@echo "  test-integration - Run integration tests only"
	@echo "  test-auth    - Run authentication tests"
	@echo "  test-config  - Run configuration tests"
	@echo "  test-db      - Run database tests"
	@echo "  test-repo    - Run repository tests"
	@echo "  test-service - Run service tests"
	@echo "  test-handler - Run handler tests"
	@echo "  test-coverage- Run tests with coverage"
	@echo "  lint         - Run linter"
	@echo "  fmt          - Format code"
	@echo "  clean        - Clean build artifacts"
	@echo "  build-prod   - Build for production"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo "  db-create    - Create database"
	@echo "  db-drop      - Drop database"
	@echo "  db-reset     - Reset database"
	@echo "  init-data    - Initialize base data"
	@echo "  setup        - Full development setup"
	@echo "  help         - Show this help" 