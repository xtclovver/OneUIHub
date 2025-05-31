.PHONY: build run test clean deps migrate init-data

BINARY_NAME=oneui-hub-server
BUILD_DIR=bin
MAIN_PATH=cmd/server/main.go

build:
	@echo "Building $(BINARY_NAME)..."
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

run:
	@echo "Starting server..."
	@go run $(MAIN_PATH)

# Запуск в режиме разработки с автоперезагрузкой
dev:
	@echo "Starting development server..."
	@air -c .air.toml

deps:
	@echo "Installing dependencies..."
	@go mod tidy
	@go mod download

test:
	@echo "Running tests..."
	@go test -v ./...

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