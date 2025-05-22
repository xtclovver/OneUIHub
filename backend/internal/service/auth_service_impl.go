package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/repository"
)

// AuthServiceImpl управляет аутентификацией пользователей
type AuthServiceImpl struct {
	userRepo    repository.UserRepository
	jwtSecret   []byte
	tokenExpiry time.Duration
}

// NewAuthServiceImpl создает новый сервис авторизации
func NewAuthServiceImpl(userRepo repository.UserRepository, jwtSecret string, tokenExpiry time.Duration) AuthService {
	return &AuthServiceImpl{
		userRepo:    userRepo,
		jwtSecret:   []byte(jwtSecret),
		tokenExpiry: tokenExpiry,
	}
}

// Register регистрирует нового пользователя
func (s *AuthServiceImpl) Register(ctx context.Context, input *domain.UserRegister) (*domain.UserResponse, string, error) {
	// Проверка наличия пользователя с таким email
	existingUser, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, "", errors.New("user with this email already exists")
	}

	// Хеширование пароля
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Используем бесплатный тир по умолчанию
	// TODO: Получение ID бесплатного тира из базы данных
	defaultTierID := "free_tier_id"

	// Создание пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        input.Email,
		PasswordHash: string(passwordHash),
		TierID:       defaultTierID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", fmt.Errorf("failed to create user: %w", err)
	}

	// Генерация токена
	token, err := s.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	// Формирование ответа
	response := &domain.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		TierID:    user.TierID,
		CreatedAt: user.CreatedAt,
	}

	return response, token, nil
}

// Login аутентифицирует пользователя и возвращает токен
func (s *AuthServiceImpl) Login(ctx context.Context, input *domain.UserLogin) (*domain.UserResponse, string, error) {
	// Поиск пользователя по email
	user, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find user: %w", err)
	}
	if user == nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Проверка пароля
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Генерация токена
	token, err := s.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	// Формирование ответа
	response := &domain.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		TierID:    user.TierID,
		CreatedAt: user.CreatedAt,
	}

	return response, token, nil
}

// GenerateToken генерирует JWT токен для пользователя
func (s *AuthServiceImpl) GenerateToken(userID, email string) (string, error) {
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"exp":   time.Now().Add(s.tokenExpiry).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return signedToken, nil
}

// ValidateToken проверяет JWT токен и возвращает ID пользователя
func (s *AuthServiceImpl) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверка алгоритма подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return s.jwtSecret, nil
	})

	if err != nil {
		return "", fmt.Errorf("invalid token: %w", err)
	}

	if !token.Valid {
		return "", errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid token claims")
	}

	// Проверка срока действия токена
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return "", errors.New("token expired")
		}
	}

	// Получение ID пользователя
	userID, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("invalid user id in token")
	}

	return userID, nil
}
