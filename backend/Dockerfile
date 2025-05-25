# Многоэтапная сборка для оптимизации размера образа

# Этап сборки
FROM golang:1.21-alpine AS builder

# Установка необходимых пакетов
RUN apk add --no-cache git ca-certificates tzdata

# Создание пользователя для безопасности
RUN adduser -D -g '' appuser

# Установка рабочей директории
WORKDIR /build

# Копирование go mod файлов
COPY go.mod go.sum ./

# Загрузка зависимостей
RUN go mod download
RUN go mod verify

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o app cmd/server/main.go

# Финальный этап
FROM scratch

# Импорт пользователя и группы из builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Импорт CA сертификатов
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Импорт временных зон
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Копирование бинарного файла
COPY --from=builder /build/app /app

# Использование непривилегированного пользователя
USER appuser

# Открытие порта
EXPOSE 8080

# Команда запуска
ENTRYPOINT ["/app"] 