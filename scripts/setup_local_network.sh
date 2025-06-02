#!/bin/bash

# Скрипт для настройки OneUIHub для работы в локальной сети

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Настройка OneUIHub для локальной сети ===${NC}"

# Функция для получения IP адреса
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        LOCAL_IP=$(hostname -I | awk '{print $1}')
    else
        echo -e "${RED}Неподдерживаемая операционная система${NC}"
        echo -e "${YELLOW}Пожалуйста, найдите IP адрес вручную и настройте конфигурацию${NC}"
        exit 1
    fi
}

# Получаем IP адрес
get_local_ip

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}Не удалось автоматически определить IP адрес${NC}"
    echo -e "${YELLOW}Пожалуйста, введите IP адрес вашего компьютера:${NC}"
    read -p "IP адрес: " LOCAL_IP
fi

echo -e "${GREEN}Обнаружен IP адрес: ${LOCAL_IP}${NC}"

# Переходим в корневую директорию проекта
cd "$(dirname "$0")/.."

# Настройка бэкенда
echo -e "${YELLOW}Настройка бэкенда...${NC}"

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo -e "${GREEN}✓ Создан файл backend/.env${NC}"
    else
        echo -e "${RED}Файл backend/env.example не найден${NC}"
        exit 1
    fi
fi

# Обновляем SERVER_HOST в .env файле бэкенда
if grep -q "SERVER_HOST=" backend/.env; then
    sed -i.bak "s/SERVER_HOST=.*/SERVER_HOST=0.0.0.0/" backend/.env
    echo -e "${GREEN}✓ Обновлен SERVER_HOST в backend/.env${NC}"
else
    echo "SERVER_HOST=0.0.0.0" >> backend/.env
    echo -e "${GREEN}✓ Добавлен SERVER_HOST в backend/.env${NC}"
fi

# Настройка фронтенда
echo -e "${YELLOW}Настройка фронтенда...${NC}"

# Создаем .env файл для фронтенда
cat > frontend/.env << EOF
# API URL для работы в локальной сети
REACT_APP_API_URL=http://${LOCAL_IP}:8080/api/v1

# Разрешаем доступ с любых IP адресов
HOST=0.0.0.0
PORT=3000

# Отключаем автоматическое открытие браузера
BROWSER=none
EOF

echo -e "${GREEN}✓ Создан файл frontend/.env${NC}"

# Проверяем зависимости
echo -e "${YELLOW}Проверка зависимостей...${NC}"

# Проверяем Go
if ! command -v go &> /dev/null; then
    echo -e "${RED}Go не установлен. Пожалуйста, установите Go 1.21+${NC}"
    exit 1
fi

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Пожалуйста, установите Node.js 18+${NC}"
    exit 1
fi

# Проверяем npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm не установлен. Пожалуйста, установите npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Все зависимости установлены${NC}"

# Устанавливаем зависимости фронтенда если нужно
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Установка зависимостей фронтенда...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Зависимости фронтенда установлены${NC}"
fi

# Устанавливаем зависимости бэкенда если нужно
echo -e "${YELLOW}Установка зависимостей бэкенда...${NC}"
cd backend
go mod tidy
cd ..
echo -e "${GREEN}✓ Зависимости бэкенда установлены${NC}"

echo -e "${GREEN}=== Настройка завершена! ===${NC}"
echo ""
echo -e "${BLUE}Для запуска приложения:${NC}"
echo ""
echo -e "${YELLOW}1. Запустите бэкенд:${NC}"
echo "   cd backend"
echo "   go run cmd/server/main.go"
echo ""
echo -e "${YELLOW}2. В новом терминале запустите фронтенд:${NC}"
echo "   cd frontend"
echo "   npm start"
echo ""
echo -e "${BLUE}Приложение будет доступно:${NC}"
echo -e "   • Локально: ${GREEN}http://localhost:3000${NC}"
echo -e "   • В локальной сети: ${GREEN}http://${LOCAL_IP}:3000${NC}"
echo ""
echo -e "${YELLOW}Для доступа с мобильных устройств используйте: ${GREEN}http://${LOCAL_IP}:3000${NC}"
echo ""
echo -e "${BLUE}Примечание:${NC} Убедитесь, что ваш файрвол разрешает подключения на порты 3000 и 8080" 