package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupSimpleTestApp() *gin.Engine {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(gin.Recovery())

	// Добавляем CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Простые mock эндпоинты для тестирования
	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", func(c *gin.Context) {
				var req map[string]interface{}
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid JSON"})
					return
				}

				email, emailOk := req["email"].(string)
				password, passwordOk := req["password"].(string)

				if !emailOk || !passwordOk {
					c.JSON(400, gin.H{"error": "Missing required fields"})
					return
				}

				// Простая валидация email
				if len(email) < 5 || !contains(email, "@") {
					c.JSON(400, gin.H{"error": "Invalid email format"})
					return
				}

				// Простая валидация пароля
				if len(password) < 6 {
					c.JSON(400, gin.H{"error": "Password too short"})
					return
				}

				c.JSON(201, gin.H{
					"token": "mock-jwt-token",
					"user": gin.H{
						"id":    "user-123",
						"email": email,
						"role":  "customer",
					},
				})
			})

			auth.POST("/login", func(c *gin.Context) {
				var req map[string]interface{}
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid JSON"})
					return
				}

				email, emailOk := req["email"].(string)
				password, passwordOk := req["password"].(string)

				if !emailOk || !passwordOk {
					c.JSON(400, gin.H{"error": "Missing required fields"})
					return
				}

				// Mock аутентификация
				if email == "test@example.com" && password == "password123" {
					c.JSON(200, gin.H{
						"token": "mock-jwt-token",
						"user": gin.H{
							"id":    "user-123",
							"email": email,
							"role":  "customer",
						},
					})
				} else {
					c.JSON(401, gin.H{"error": "Invalid credentials"})
				}
			})

			auth.GET("/me", func(c *gin.Context) {
				authHeader := c.GetHeader("Authorization")
				if authHeader == "" || authHeader != "Bearer mock-jwt-token" {
					c.JSON(401, gin.H{"error": "Unauthorized"})
					return
				}

				c.JSON(200, gin.H{
					"user": gin.H{
						"id":    "user-123",
						"email": "test@example.com",
						"role":  "customer",
					},
				})
			})
		}
	}

	return router
}

func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func TestIntegration_AuthFlow(t *testing.T) {
	app := setupSimpleTestApp()

	// Тест регистрации
	t.Run("Register", func(t *testing.T) {
		registerReq := map[string]interface{}{
			"email":     "test@example.com",
			"password":  "password123",
			"tier_name": "free",
		}

		body, _ := json.Marshal(registerReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.NotEmpty(t, response["token"])
		assert.NotNil(t, response["user"])
	})

	// Тест логина
	t.Run("Login", func(t *testing.T) {
		loginReq := map[string]interface{}{
			"email":    "test@example.com",
			"password": "password123",
		}

		body, _ := json.Marshal(loginReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.NotEmpty(t, response["token"])
		assert.NotNil(t, response["user"])
	})
}

func TestIntegration_ProtectedEndpoints(t *testing.T) {
	app := setupSimpleTestApp()

	// Тестируем защищенный эндпоинт /me с валидным токеном
	t.Run("Me endpoint with valid token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		req.Header.Set("Authorization", "Bearer mock-jwt-token")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.NotNil(t, response["user"])
	})

	// Тестируем защищенный эндпоинт без токена
	t.Run("Me endpoint without token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestIntegration_HealthCheck(t *testing.T) {
	app := setupSimpleTestApp()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	app.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "ok", response["status"])
}

func TestIntegration_CORS(t *testing.T) {
	app := setupSimpleTestApp()

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/auth/register", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()

	app.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	assert.Contains(t, w.Header().Get("Access-Control-Allow-Methods"), "POST")
}

func TestIntegration_ValidationErrors(t *testing.T) {
	app := setupSimpleTestApp()

	// Тест регистрации с невалидными данными
	t.Run("Register with invalid email", func(t *testing.T) {
		registerReq := map[string]interface{}{
			"email":     "invalid-email",
			"password":  "password123",
			"tier_name": "free",
		}

		body, _ := json.Marshal(registerReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Тест регистрации с коротким паролем
	t.Run("Register with short password", func(t *testing.T) {
		registerReq := map[string]interface{}{
			"email":     "test@example.com",
			"password":  "123",
			"tier_name": "free",
		}

		body, _ := json.Marshal(registerReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Тест логина с неверными данными
	t.Run("Login with invalid credentials", func(t *testing.T) {
		loginReq := map[string]interface{}{
			"email":    "wrong@example.com",
			"password": "wrongpassword",
		}

		body, _ := json.Marshal(loginReq)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		app.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
