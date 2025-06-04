package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/service"
	"oneui-hub/pkg/auth"
)

// Mock UserService
type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) CreateUser(ctx context.Context, req *service.CreateUserRequest) (*domain.User, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserService) AuthenticateUser(ctx context.Context, req *service.LoginRequest) (*domain.User, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserService) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserService) UpdateUser(ctx context.Context, id string, req *service.UpdateUserRequest) (*domain.User, error) {
	args := m.Called(ctx, id, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserService) DeleteUser(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserService) ListUsers(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	args := m.Called(ctx, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.User), args.Error(1)
}

func (m *MockUserService) ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error {
	args := m.Called(ctx, userID, oldPassword, newPassword)
	return args.Error(0)
}

func setupAuthHandler() (*AuthHandler, *MockUserService, *auth.JWTManager) {
	mockUserService := new(MockUserService)
	jwtManager := auth.NewJWTManager("test-secret", time.Hour)
	handler := NewAuthHandler(mockUserService, jwtManager)
	return handler, mockUserService, jwtManager
}

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler, mockUserService, _ := setupAuthHandler()

	tests := []struct {
		name           string
		requestBody    RegisterRequest
		mockSetup      func(*MockUserService)
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "successful registration",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				TierName: "free",
			},
			mockSetup: func(m *MockUserService) {
				user := &domain.User{
					ID:    uuid.New().String(),
					Email: "test@example.com",
					Role:  domain.RoleCustomer,
				}
				m.On("CreateUser", mock.Anything, mock.AnythingOfType("*service.CreateUserRequest")).Return(user, nil)
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response AuthResponse
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.NotEmpty(t, response.Token)
				assert.NotNil(t, response.User)
			},
		},
		{
			name: "invalid email",
			requestBody: RegisterRequest{
				Email:    "invalid-email",
				Password: "password123",
			},
			mockSetup:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "email")
			},
		},
		{
			name: "short password",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "123",
			},
			mockSetup:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "min")
			},
		},
		{
			name: "user creation error",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockSetup: func(m *MockUserService) {
				m.On("CreateUser", mock.Anything, mock.AnythingOfType("*service.CreateUserRequest")).Return(nil, assert.AnError)
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.NotEmpty(t, response["error"])
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Сбрасываем моки
			mockUserService.ExpectedCalls = nil
			tt.mockSetup(mockUserService)

			// Создаем запрос
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			// Создаем gin контекст
			c, _ := gin.CreateTestContext(w)
			c.Request = req

			// Выполняем хендлер
			handler.Register(c)

			// Проверяем результат
			assert.Equal(t, tt.expectedStatus, w.Code)
			tt.checkResponse(t, w)
		})
	}
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler, mockUserService, _ := setupAuthHandler()

	tests := []struct {
		name           string
		requestBody    LoginRequest
		mockSetup      func(*MockUserService)
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "successful login",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockSetup: func(m *MockUserService) {
				user := &domain.User{
					ID:    uuid.New().String(),
					Email: "test@example.com",
					Role:  domain.RoleCustomer,
				}
				m.On("AuthenticateUser", mock.Anything, mock.AnythingOfType("*service.LoginRequest")).Return(user, nil)
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response AuthResponse
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.NotEmpty(t, response.Token)
				assert.NotNil(t, response.User)
			},
		},
		{
			name: "invalid credentials",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "wrongpassword",
			},
			mockSetup: func(m *MockUserService) {
				m.On("AuthenticateUser", mock.Anything, mock.AnythingOfType("*service.LoginRequest")).Return(nil, assert.AnError)
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "Invalid credentials")
			},
		},
		{
			name: "invalid email format",
			requestBody: LoginRequest{
				Email:    "invalid-email",
				Password: "password123",
			},
			mockSetup:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "email")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Сбрасываем моки
			mockUserService.ExpectedCalls = nil
			tt.mockSetup(mockUserService)

			// Создаем запрос
			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			// Создаем gin контекст
			c, _ := gin.CreateTestContext(w)
			c.Request = req

			// Выполняем хендлер
			handler.Login(c)

			// Проверяем результат
			assert.Equal(t, tt.expectedStatus, w.Code)
			tt.checkResponse(t, w)
		})
	}
}

func TestAuthHandler_RefreshToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler, _, jwtManager := setupAuthHandler()

	// Создаем валидный токен
	user := &domain.User{
		ID:    uuid.New().String(),
		Email: "test@example.com",
		Role:  domain.RoleCustomer,
	}
	validToken, _ := jwtManager.GenerateToken(user)

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name:           "successful token refresh",
			authHeader:     "Bearer " + validToken,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.NotEmpty(t, response["token"])
			},
		},
		{
			name:           "missing authorization header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "Authorization header required")
			},
		},
		{
			name:           "invalid authorization header format",
			authHeader:     "InvalidFormat " + validToken,
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "Invalid authorization header format")
			},
		},
		{
			name:           "invalid token",
			authHeader:     "Bearer invalid-token",
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "Failed to refresh token")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Создаем запрос
			req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			w := httptest.NewRecorder()

			// Создаем gin контекст
			c, _ := gin.CreateTestContext(w)
			c.Request = req

			// Выполняем хендлер
			handler.RefreshToken(c)

			// Проверяем результат
			assert.Equal(t, tt.expectedStatus, w.Code)
			tt.checkResponse(t, w)
		})
	}
}

func TestAuthHandler_Me(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler, mockUserService, _ := setupAuthHandler()

	userID := uuid.New().String()
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
		Role:  domain.RoleCustomer,
	}

	tests := []struct {
		name           string
		setupContext   func(*gin.Context)
		mockSetup      func(*MockUserService)
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "successful get user info",
			setupContext: func(c *gin.Context) {
				c.Set("user_id", userID)
			},
			mockSetup: func(m *MockUserService) {
				m.On("GetUserByID", mock.Anything, userID).Return(user, nil)
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.NotNil(t, response["user"])
			},
		},
		{
			name: "user not authenticated",
			setupContext: func(c *gin.Context) {
				// Не устанавливаем user_id
			},
			mockSetup:      func(m *MockUserService) {},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "User not authenticated")
			},
		},
		{
			name: "user not found",
			setupContext: func(c *gin.Context) {
				c.Set("user_id", userID)
			},
			mockSetup: func(m *MockUserService) {
				m.On("GetUserByID", mock.Anything, userID).Return(nil, assert.AnError)
			},
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response["error"], "User not found")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Сбрасываем моки
			mockUserService.ExpectedCalls = nil
			tt.mockSetup(mockUserService)

			// Создаем запрос
			req := httptest.NewRequest(http.MethodGet, "/me", nil)
			w := httptest.NewRecorder()

			// Создаем gin контекст
			c, _ := gin.CreateTestContext(w)
			c.Request = req
			tt.setupContext(c)

			// Выполняем хендлер
			handler.Me(c)

			// Проверяем результат
			assert.Equal(t, tt.expectedStatus, w.Code)
			tt.checkResponse(t, w)
		})
	}
}
