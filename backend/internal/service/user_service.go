package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/repository"
)

type UserService struct {
	userRepo      repository.UserRepository
	userLimitRepo repository.UserLimitRepository
	tierRepo      repository.TierRepository
}

func NewUserService(
	userRepo repository.UserRepository,
	userLimitRepo repository.UserLimitRepository,
	tierRepo repository.TierRepository,
) *UserService {
	return &UserService{
		userRepo:      userRepo,
		userLimitRepo: userLimitRepo,
		tierRepo:      tierRepo,
	}
}

type CreateUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	TierName string `json:"tier_name,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateUserRequest struct {
	Email  string           `json:"email,omitempty" validate:"omitempty,email"`
	TierID string           `json:"tier_id,omitempty"`
	Role   *domain.UserRole `json:"role,omitempty"`
}

func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest) (*domain.User, error) {
	// Проверяем, что пользователь с таким email не существует
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("user with email %s already exists", req.Email)
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Получаем тир (по умолчанию free)
	tierName := req.TierName
	if tierName == "" {
		tierName = "free"
	}

	tier, err := s.tierRepo.GetByName(ctx, tierName)
	if err != nil {
		return nil, fmt.Errorf("failed to get tier: %w", err)
	}

	// Создаем пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Создаем лимиты пользователя
	userLimit := &domain.UserLimit{
		UserID:  user.ID,
		Balance: 0.0,
	}

	if err := s.userLimitRepo.Create(ctx, userLimit); err != nil {
		return nil, fmt.Errorf("failed to create user limits: %w", err)
	}

	// Загружаем полные данные пользователя
	return s.userRepo.GetByID(ctx, user.ID)
}

func (s *UserService) AuthenticateUser(ctx context.Context, req *LoginRequest) (*domain.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	return user, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

func (s *UserService) UpdateUser(ctx context.Context, id string, req *UpdateUserRequest) (*domain.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if req.Email != "" {
		// Проверяем, что email не занят другим пользователем
		existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
		if err == nil && existingUser != nil && existingUser.ID != id {
			return nil, fmt.Errorf("email %s is already taken", req.Email)
		}
		user.Email = req.Email
	}

	if req.TierID != "" {
		// Проверяем, что тир существует
		_, err := s.tierRepo.GetByID(ctx, req.TierID)
		if err != nil {
			return nil, fmt.Errorf("tier not found: %w", err)
		}
		user.TierID = req.TierID
	}

	if req.Role != nil {
		user.Role = *req.Role
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return s.userRepo.GetByID(ctx, id)
}

func (s *UserService) DeleteUser(ctx context.Context, id string) error {
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	return s.userRepo.Delete(ctx, id)
}

func (s *UserService) ListUsers(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	return s.userRepo.List(ctx, limit, offset)
}

func (s *UserService) ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Проверяем старый пароль
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
		return fmt.Errorf("invalid old password")
	}

	// Хешируем новый пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	user.PasswordHash = string(hashedPassword)
	return s.userRepo.Update(ctx, user)
}
