package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config структура с конфигурацией приложения
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
	LiteLLM  LiteLLMConfig
}

// ServerConfig конфигурация HTTP сервера
type ServerConfig struct {
	Port            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
}

// DatabaseConfig конфигурация базы данных
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// AuthConfig конфигурация авторизации
type AuthConfig struct {
	JWTSecret            string
	TokenExpirationHrs   int
	RefreshExpirationHrs int
}

// LiteLLMConfig конфигурация LiteLLM
type LiteLLMConfig struct {
	BaseURL       string
	APIKey        string
	ClientTimeout time.Duration
	SyncInterval  time.Duration
}

// GetDSN возвращает строку подключения к БД
func (db DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s",
		db.User, db.Password, db.Host, db.Port, db.DBName)
}

// New создает новую конфигурацию из переменных окружения
func New() (*Config, error) {
	port := getEnv("SERVER_PORT", "8080")

	readTimeout, err := strconv.Atoi(getEnv("SERVER_READ_TIMEOUT", "5"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение SERVER_READ_TIMEOUT: %w", err)
	}

	writeTimeout, err := strconv.Atoi(getEnv("SERVER_WRITE_TIMEOUT", "10"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение SERVER_WRITE_TIMEOUT: %w", err)
	}

	shutdownTimeout, err := strconv.Atoi(getEnv("SERVER_SHUTDOWN_TIMEOUT", "5"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение SERVER_SHUTDOWN_TIMEOUT: %w", err)
	}

	jwtTokenExpirationHrs, err := strconv.Atoi(getEnv("JWT_TOKEN_EXPIRATION_HRS", "24"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение JWT_TOKEN_EXPIRATION_HRS: %w", err)
	}

	jwtRefreshExpirationHrs, err := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRATION_HRS", "168"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение JWT_REFRESH_EXPIRATION_HRS: %w", err)
	}

	litellmClientTimeout, err := strconv.Atoi(getEnv("LITELLM_CLIENT_TIMEOUT", "30"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение LITELLM_CLIENT_TIMEOUT: %w", err)
	}

	litellmSyncInterval, err := strconv.Atoi(getEnv("LITELLM_SYNC_INTERVAL", "3600"))
	if err != nil {
		return nil, fmt.Errorf("неверное значение LITELLM_SYNC_INTERVAL: %w", err)
	}

	return &Config{
		Server: ServerConfig{
			Port:            port,
			ReadTimeout:     time.Duration(readTimeout) * time.Second,
			WriteTimeout:    time.Duration(writeTimeout) * time.Second,
			ShutdownTimeout: time.Duration(shutdownTimeout) * time.Second,
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", "12341234"),
			DBName:   getEnv("DB_NAME", "oneaihub"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Auth: AuthConfig{
			JWTSecret:            getEnv("JWT_SECRET", "super-secret-key"),
			TokenExpirationHrs:   jwtTokenExpirationHrs,
			RefreshExpirationHrs: jwtRefreshExpirationHrs,
		},
		LiteLLM: LiteLLMConfig{
			BaseURL:       getEnv("LITELLM_BASE_URL", "http://localhost:8000"),
			APIKey:        getEnv("LITELLM_API_KEY", ""),
			ClientTimeout: time.Duration(litellmClientTimeout) * time.Second,
			SyncInterval:  time.Duration(litellmSyncInterval) * time.Second,
		},
	}, nil
}

// getEnv получает значение переменной окружения или возвращает значение по умолчанию
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
