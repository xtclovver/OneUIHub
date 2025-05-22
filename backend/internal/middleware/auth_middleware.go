package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/oneaihub/backend/internal/service"
)

// AuthMiddleware представляет собой middleware для проверки авторизации
type AuthMiddleware struct {
	authService service.AuthService
}

// NewAuthMiddleware создает новый middleware авторизации
func NewAuthMiddleware(authService service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// Authorized проверяет наличие и валидность JWT токена
func (m *AuthMiddleware) Authorized() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			c.Abort()
			return
		}

		// Извлечение токена из заголовка Authorization
		// Формат: Bearer <token>
		parts := strings.Split(auth, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		tokenStr := parts[1]

		// Проверка токена
		userID, err := m.authService.ValidateToken(tokenStr)
		if err != nil {
			var statusCode int
			if errors.Is(err, errors.New("token expired")) {
				statusCode = http.StatusUnauthorized
			} else {
				statusCode = http.StatusForbidden
			}

			c.JSON(statusCode, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Установка ID пользователя в контекст запроса
		c.Set("user_id", userID)
		c.Next()
	}
}

// GetUserID получает ID пользователя из контекста
func GetUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}

	userIDStr, ok := userID.(string)
	return userIDStr, ok
}
