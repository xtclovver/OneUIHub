#!/bin/bash

# Скрипт для запуска фронтенда OneUIHub в режиме разработки

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Запуск OneUIHub Frontend ===${NC}"

# Переходим в директорию frontend
cd "$(dirname "$0")/.."

# Проверяем, что node установлен
if ! command -v node &> /dev/null; then
    echo -e "${RED}Ошибка: Node.js не установлен${NC}"
    exit 1
fi

# Проверяем, что npm установлен
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Ошибка: npm не установлен${NC}"
    exit 1
fi

# Проверяем, что package.json существует
if [ ! -f "package.json" ]; then
    echo -e "${RED}Ошибка: package.json не найден${NC}"
    exit 1
fi

# Устанавливаем зависимости если node_modules не существует
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Устанавливаем зависимости...${NC}"
    npm install
fi

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Создаем .env файл...${NC}"
    echo "REACT_APP_API_URL=http://localhost:8080/api/v1" > .env
    echo -e "${GREEN}✓ .env файл создан${NC}"
fi

# Запускаем фронтенд
echo -e "${GREEN}Запускаем фронтенд...${NC}"
echo -e "${YELLOW}Приложение будет доступно по адресу: http://localhost:3000${NC}"
echo -e "${YELLOW}Для остановки нажмите Ctrl+C${NC}"
echo ""

npm start 