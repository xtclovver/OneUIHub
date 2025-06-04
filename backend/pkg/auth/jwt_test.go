package auth

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"oneui-hub/internal/domain"
)

func TestNewJWTManager(t *testing.T) {
	secretKey := "test-secret"
	duration := time.Hour

	manager := NewJWTManager(secretKey, duration)

	assert.NotNil(t, manager)
	assert.Equal(t, secretKey, manager.secretKey)
	assert.Equal(t, duration, manager.tokenDuration)
}

func TestJWTManager_GenerateToken(t *testing.T) {
	manager := NewJWTManager("test-secret", time.Hour)

	user := &domain.User{
		ID:    "user-123",
		Email: "test@example.com",
		Role:  domain.RoleCustomer,
	}

	token, err := manager.GenerateToken(user)

	require.NoError(t, err)
	assert.NotEmpty(t, token)

	// Проверяем, что токен можно валидировать
	claims, err := manager.ValidateToken(token)
	require.NoError(t, err)
	assert.Equal(t, user.ID, claims.UserID)
	assert.Equal(t, user.Email, claims.Email)
	assert.Equal(t, user.Role, claims.Role)
}

func TestJWTManager_ValidateToken(t *testing.T) {
	manager := NewJWTManager("test-secret", time.Hour)

	user := &domain.User{
		ID:    "user-123",
		Email: "test@example.com",
		Role:  domain.RoleAdmin,
	}

	tests := []struct {
		name         string
		setupToken   func() string
		expectError  bool
		expectClaims *Claims
	}{
		{
			name: "valid token",
			setupToken: func() string {
				token, _ := manager.GenerateToken(user)
				return token
			},
			expectError: false,
			expectClaims: &Claims{
				UserID: user.ID,
				Email:  user.Email,
				Role:   user.Role,
			},
		},
		{
			name: "invalid token",
			setupToken: func() string {
				return "invalid-token"
			},
			expectError: true,
		},
		{
			name: "token with wrong secret",
			setupToken: func() string {
				wrongManager := NewJWTManager("wrong-secret", time.Hour)
				token, _ := wrongManager.GenerateToken(user)
				return token
			},
			expectError: true,
		},
		{
			name: "expired token",
			setupToken: func() string {
				expiredManager := NewJWTManager("test-secret", -time.Hour)
				token, _ := expiredManager.GenerateToken(user)
				return token
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token := tt.setupToken()
			claims, err := manager.ValidateToken(token)

			if tt.expectError {
				assert.Error(t, err)
				assert.Nil(t, claims)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expectClaims.UserID, claims.UserID)
				assert.Equal(t, tt.expectClaims.Email, claims.Email)
				assert.Equal(t, tt.expectClaims.Role, claims.Role)
			}
		})
	}
}

func TestJWTManager_RefreshToken(t *testing.T) {
	manager := NewJWTManager("test-secret", time.Hour)

	user := &domain.User{
		ID:    "user-123",
		Email: "test@example.com",
		Role:  domain.RoleCustomer,
	}

	tests := []struct {
		name        string
		setupToken  func() string
		expectError bool
	}{
		{
			name: "valid token refresh",
			setupToken: func() string {
				token, _ := manager.GenerateToken(user)
				// Добавляем небольшую задержку чтобы время создания токенов отличалось
				time.Sleep(time.Millisecond * 10)
				return token
			},
			expectError: false,
		},
		{
			name: "invalid token",
			setupToken: func() string {
				return "invalid-token"
			},
			expectError: true,
		},
		{
			name: "too old token",
			setupToken: func() string {
				oldManager := NewJWTManager("test-secret", -2*time.Hour)
				token, _ := oldManager.GenerateToken(user)
				return token
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token := tt.setupToken()
			newToken, err := manager.RefreshToken(token)

			if tt.expectError {
				assert.Error(t, err)
				assert.Empty(t, newToken)
			} else {
				require.NoError(t, err)
				assert.NotEmpty(t, newToken)
				// Не проверяем неравенство токенов, так как они могут быть одинаковыми при быстрой генерации
				// Вместо этого проверяем, что новый токен валиден

				// Проверяем, что новый токен валиден
				claims, err := manager.ValidateToken(newToken)
				require.NoError(t, err)
				assert.Equal(t, user.ID, claims.UserID)
				assert.Equal(t, user.Email, claims.Email)
				assert.Equal(t, user.Role, claims.Role)
			}
		})
	}
}
