package auth

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEncryptDecryptAPIKey(t *testing.T) {
	// Сохраняем оригинальный ключ
	originalKey := os.Getenv("ENCRYPTION_KEY")
	defer func() {
		if originalKey != "" {
			os.Setenv("ENCRYPTION_KEY", originalKey)
		} else {
			os.Unsetenv("ENCRYPTION_KEY")
		}
	}()

	// Устанавливаем тестовый ключ
	testKey := "testkeyfortesting123456789012345"
	os.Setenv("ENCRYPTION_KEY", testKey)

	// Переинициализируем ключ шифрования
	encryptionKey = []byte(testKey)[:32]

	tests := []struct {
		name      string
		plaintext string
	}{
		{
			name:      "simple api key",
			plaintext: "sk-1234567890abcdef",
		},
		{
			name:      "long api key",
			plaintext: "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890",
		},
		{
			name:      "empty string",
			plaintext: "",
		},
		{
			name:      "special characters",
			plaintext: "sk-!@#$%^&*()_+-=[]{}|;':\",./<>?",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Шифруем
			encrypted, err := EncryptAPIKey(tt.plaintext)
			require.NoError(t, err)
			assert.NotEmpty(t, encrypted)
			assert.NotEqual(t, tt.plaintext, encrypted)

			// Расшифровываем
			decrypted, err := DecryptAPIKey(encrypted)
			require.NoError(t, err)
			assert.Equal(t, tt.plaintext, decrypted)
		})
	}
}

func TestEncryptAPIKey_DifferentResults(t *testing.T) {
	plaintext := "sk-1234567890abcdef"

	// Шифруем один и тот же текст дважды
	encrypted1, err := EncryptAPIKey(plaintext)
	require.NoError(t, err)

	encrypted2, err := EncryptAPIKey(plaintext)
	require.NoError(t, err)

	// Результаты должны быть разными (из-за случайного nonce)
	assert.NotEqual(t, encrypted1, encrypted2)

	// Но оба должны расшифровываться в исходный текст
	decrypted1, err := DecryptAPIKey(encrypted1)
	require.NoError(t, err)
	assert.Equal(t, plaintext, decrypted1)

	decrypted2, err := DecryptAPIKey(encrypted2)
	require.NoError(t, err)
	assert.Equal(t, plaintext, decrypted2)
}

func TestDecryptAPIKey_InvalidInput(t *testing.T) {
	tests := []struct {
		name       string
		ciphertext string
	}{
		{
			name:       "invalid base64",
			ciphertext: "invalid-base64!@#",
		},
		{
			name:       "too short ciphertext",
			ciphertext: "dGVzdA==", // "test" в base64, но слишком короткий для GCM
		},
		{
			name:       "empty string",
			ciphertext: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := DecryptAPIKey(tt.ciphertext)
			assert.Error(t, err)
		})
	}
}

func TestCreateAPIKeyPreview(t *testing.T) {
	tests := []struct {
		name     string
		apiKey   string
		expected string
	}{
		{
			name:     "normal api key",
			apiKey:   "sk-1234567890abcdef",
			expected: "sk-12...bcdef",
		},
		{
			name:     "long api key",
			apiKey:   "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890",
			expected: "sk-pr...67890",
		},
		{
			name:     "short api key",
			apiKey:   "short",
			expected: "short",
		},
		{
			name:     "exactly 10 chars",
			apiKey:   "1234567890",
			expected: "1234567890",
		},
		{
			name:     "empty string",
			apiKey:   "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CreateAPIKeyPreview(tt.apiKey)
			assert.Equal(t, tt.expected, result)
		})
	}
}
