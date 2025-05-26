package config

import (
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
	LiteLLM  LiteLLMConfig
}

type ServerConfig struct {
	Host string
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	DSN      string
}

type AuthConfig struct {
	JWTSecret     string
	TokenDuration time.Duration
}

type LiteLLMConfig struct {
	BaseURL string
	APIKey  string
	Timeout time.Duration
}

func Load() (*Config, error) {
	// Получаем путь к корню backend директории
	_, filename, _, _ := runtime.Caller(0)
	backendRoot := filepath.Join(filepath.Dir(filename), "..", "..")
	envPath := filepath.Join(backendRoot, ".env")

	// Загружаем .env файл, если он существует
	if _, err := os.Stat(envPath); err == nil {
		if err := godotenv.Load(envPath); err != nil {
			// Логируем ошибку, но не прерываем выполнение
			// Можем работать с переменными окружения системы
			println("Warning: failed to load .env file:", err.Error())
		}
	} else {
		// Пробуем загрузить из текущей директории
		_ = godotenv.Load()
	}

	config := &Config{
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "localhost"),
			Port: getEnv("SERVER_PORT", "8080"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "oneui_hub"),
		},
		Auth: AuthConfig{
			JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
			TokenDuration: getDurationEnv("TOKEN_DURATION", 24*time.Hour),
		},
		LiteLLM: LiteLLMConfig{
			BaseURL: getEnv("LITELLM_BASE_URL", "http://localhost:4000"),
			APIKey:  getEnv("LITELLM_API_KEY", ""),
			Timeout: getDurationEnv("LITELLM_TIMEOUT", 30*time.Second),
		},
	}

	// Создаем DSN для подключения к базе данных
	config.Database.DSN = config.Database.User + ":" + config.Database.Password +
		"@tcp(" + config.Database.Host + ":" + config.Database.Port + ")/" +
		config.Database.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// Debug выводит информацию о загруженной конфигурации
func (c *Config) Debug() {
	println("=== Configuration Debug ===")
	println("Server Host:", c.Server.Host)
	println("Server Port:", c.Server.Port)
	println("DB Host:", c.Database.Host)
	println("DB Port:", c.Database.Port)
	println("DB User:", c.Database.User)
	println("DB Name:", c.Database.DBName)
	println("DB Password:", c.Database.Password)
	println("JWT Secret:", c.Auth.JWTSecret[:10]+"...")
	println("LiteLLM Base URL:", c.LiteLLM.BaseURL)
	println("===========================")
}
