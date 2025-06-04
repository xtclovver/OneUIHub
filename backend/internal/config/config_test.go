package config

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// saveEnvVars сохраняет текущие значения переменных окружения
func saveEnvVars() map[string]string {
	envVars := []string{
		"SERVER_HOST", "SERVER_PORT",
		"DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
		"JWT_SECRET", "TOKEN_DURATION",
		"LITELLM_BASE_URL", "LITELLM_API_KEY", "LITELLM_TIMEOUT",
		"EXCHANGE_RATE_API_KEY",
	}

	saved := make(map[string]string)
	for _, env := range envVars {
		if value, exists := os.LookupEnv(env); exists {
			saved[env] = value
		}
	}
	return saved
}

// restoreEnvVars восстанавливает переменные окружения
func restoreEnvVars(saved map[string]string) {
	clearEnvVars()
	for key, value := range saved {
		os.Setenv(key, value)
	}
}

// loadConfigForTest загружает конфигурацию без .env файла для тестирования
func loadConfigForTest() (*Config, error) {
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
		Currency: CurrencyConfig{
			ExchangeRateAPIKey: getEnv("EXCHANGE_RATE_API_KEY", ""),
		},
	}

	// Создаем DSN для подключения к базе данных
	config.Database.DSN = config.Database.User + ":" + config.Database.Password +
		"@tcp(" + config.Database.Host + ":" + config.Database.Port + ")/" +
		config.Database.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"

	return config, nil
}

func TestLoad(t *testing.T) {
	// Сохраняем текущие переменные окружения
	savedEnv := saveEnvVars()
	defer restoreEnvVars(savedEnv)

	tests := []struct {
		name     string
		envVars  map[string]string
		expected *Config
	}{
		{
			name:    "default config",
			envVars: map[string]string{},
			expected: &Config{
				Server: ServerConfig{
					Host: "localhost",
					Port: "8080",
				},
				Database: DatabaseConfig{
					Host:     "localhost",
					Port:     "3306",
					User:     "root",
					Password: "",
					DBName:   "oneui_hub",
					DSN:      "root:@tcp(localhost:3306)/oneui_hub?charset=utf8mb4&parseTime=True&loc=Local",
				},
				Auth: AuthConfig{
					JWTSecret:     "your-secret-key",
					TokenDuration: 24 * time.Hour,
				},
				LiteLLM: LiteLLMConfig{
					BaseURL: "http://localhost:4000",
					APIKey:  "",
					Timeout: 30 * time.Second,
				},
				Currency: CurrencyConfig{
					ExchangeRateAPIKey: "",
				},
			},
		},
		{
			name: "custom config",
			envVars: map[string]string{
				"SERVER_HOST":           "0.0.0.0",
				"SERVER_PORT":           "9090",
				"DB_HOST":               "db.example.com",
				"DB_PORT":               "5432",
				"DB_USER":               "admin",
				"DB_PASSWORD":           "secret",
				"DB_NAME":               "testdb",
				"JWT_SECRET":            "super-secret",
				"TOKEN_DURATION":        "2h",
				"LITELLM_BASE_URL":      "http://litellm:4000",
				"LITELLM_API_KEY":       "test-key",
				"LITELLM_TIMEOUT":       "60s",
				"EXCHANGE_RATE_API_KEY": "exchange-key",
			},
			expected: &Config{
				Server: ServerConfig{
					Host: "0.0.0.0",
					Port: "9090",
				},
				Database: DatabaseConfig{
					Host:     "db.example.com",
					Port:     "5432",
					User:     "admin",
					Password: "secret",
					DBName:   "testdb",
					DSN:      "admin:secret@tcp(db.example.com:5432)/testdb?charset=utf8mb4&parseTime=True&loc=Local",
				},
				Auth: AuthConfig{
					JWTSecret:     "super-secret",
					TokenDuration: 2 * time.Hour,
				},
				LiteLLM: LiteLLMConfig{
					BaseURL: "http://litellm:4000",
					APIKey:  "test-key",
					Timeout: 60 * time.Second,
				},
				Currency: CurrencyConfig{
					ExchangeRateAPIKey: "exchange-key",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Очищаем переменные окружения перед тестом
			clearEnvVars()

			// Устанавливаем тестовые переменные окружения
			for key, value := range tt.envVars {
				os.Setenv(key, value)
			}

			cfg, err := loadConfigForTest()
			require.NoError(t, err)
			assert.Equal(t, tt.expected, cfg)
		})
	}
}

func TestGetEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue string
		envValue     string
		expected     string
	}{
		{
			name:         "env var exists",
			key:          "TEST_VAR",
			defaultValue: "default",
			envValue:     "test_value",
			expected:     "test_value",
		},
		{
			name:         "env var does not exist",
			key:          "NON_EXISTENT_VAR",
			defaultValue: "default",
			envValue:     "",
			expected:     "default",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getEnv(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetDurationEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue time.Duration
		envValue     string
		expected     time.Duration
	}{
		{
			name:         "valid duration",
			key:          "TEST_DURATION",
			defaultValue: time.Hour,
			envValue:     "30m",
			expected:     30 * time.Minute,
		},
		{
			name:         "invalid duration",
			key:          "INVALID_DURATION",
			defaultValue: time.Hour,
			envValue:     "invalid",
			expected:     time.Hour,
		},
		{
			name:         "no env var",
			key:          "NON_EXISTENT_DURATION",
			defaultValue: time.Hour,
			envValue:     "",
			expected:     time.Hour,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getDurationEnv(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetIntEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue int
		envValue     string
		expected     int
	}{
		{
			name:         "valid int",
			key:          "TEST_INT",
			defaultValue: 10,
			envValue:     "20",
			expected:     20,
		},
		{
			name:         "invalid int",
			key:          "INVALID_INT",
			defaultValue: 10,
			envValue:     "not_a_number",
			expected:     10,
		},
		{
			name:         "no env var",
			key:          "NON_EXISTENT_INT",
			defaultValue: 10,
			envValue:     "",
			expected:     10,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getIntEnv(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func clearEnvVars() {
	envVars := []string{
		"SERVER_HOST", "SERVER_PORT",
		"DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
		"JWT_SECRET", "TOKEN_DURATION",
		"LITELLM_BASE_URL", "LITELLM_API_KEY", "LITELLM_TIMEOUT",
		"EXCHANGE_RATE_API_KEY",
	}

	for _, env := range envVars {
		os.Unsetenv(env)
	}
}
