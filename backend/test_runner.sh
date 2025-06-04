#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода заголовков
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Функция для вывода результата
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 прошли успешно${NC}"
    else
        echo -e "${RED}✗ $2 провалились${NC}"
        return 1
    fi
}

# Переменные для подсчета результатов
TOTAL_TESTS=0
FAILED_TESTS=0

# Установка зависимостей
print_header "Установка зависимостей"
go mod download
go mod tidy
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей${NC}"
    exit 1
fi
echo -e "${GREEN}Зависимости установлены успешно${NC}"

# Проверка форматирования кода
print_header "Проверка форматирования кода"
UNFORMATTED=$(gofmt -l .)
if [ -n "$UNFORMATTED" ]; then
    echo -e "${RED}Следующие файлы не отформатированы:${NC}"
    echo "$UNFORMATTED"
    echo -e "${YELLOW}Запустите 'go fmt ./...' для исправления${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    echo -e "${GREEN}✓ Все файлы отформатированы правильно${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Проверка с go vet
print_header "Проверка кода с go vet"
go vet ./...
print_result $? "Проверки go vet"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты конфигурации
print_header "Тестирование конфигурации"
go test -v ./internal/config/...
print_result $? "Тесты конфигурации"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты аутентификации
print_header "Тестирование аутентификации"
go test -v ./pkg/auth/...
print_result $? "Тесты аутентификации"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты базы данных
print_header "Тестирование базы данных"
go test -v ./pkg/database/...
print_result $? "Тесты базы данных"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты репозиториев
print_header "Тестирование репозиториев"
go test -v ./internal/repository/...
print_result $? "Тесты репозиториев"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты сервисов
print_header "Тестирование сервисов"
go test -v ./internal/service/...
print_result $? "Тесты сервисов"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты хендлеров
print_header "Тестирование хендлеров"
go test -v ./internal/api/handlers/...
print_result $? "Тесты хендлеров"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Интеграционные тесты
print_header "Интеграционные тесты"
go test -v -run TestIntegration ./...
print_result $? "Интеграционные тесты"
if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Тесты с покрытием кода
print_header "Анализ покрытия кода"
go test -race -coverprofile=coverage.out ./...
if [ $? -eq 0 ]; then
    go tool cover -html=coverage.out -o coverage.html
    COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
    echo -e "${GREEN}✓ Покрытие кода: $COVERAGE${NC}"
    echo -e "${BLUE}Отчет о покрытии создан: coverage.html${NC}"
else
    echo -e "${RED}✗ Ошибка при анализе покрытия кода${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Финальный отчет
print_header "Итоговый отчет"
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))

echo -e "Всего тестовых наборов: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Прошли успешно: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Провалились: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Все тесты прошли успешно!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Некоторые тесты провалились. Проверьте вывод выше.${NC}"
    exit 1
fi 