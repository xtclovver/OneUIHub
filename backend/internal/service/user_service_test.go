package service

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"

	"oneui-hub/internal/domain"
)

// Mock репозитории
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserRepository) List(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	args := m.Called(ctx, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.User), args.Error(1)
}

type MockUserLimitRepository struct {
	mock.Mock
}

func (m *MockUserLimitRepository) Create(ctx context.Context, userLimit *domain.UserLimit) error {
	args := m.Called(ctx, userLimit)
	return args.Error(0)
}

func (m *MockUserLimitRepository) GetByUserID(ctx context.Context, userID string) (*domain.UserLimit, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.UserLimit), args.Error(1)
}

func (m *MockUserLimitRepository) Update(ctx context.Context, userLimit *domain.UserLimit) error {
	args := m.Called(ctx, userLimit)
	return args.Error(0)
}

func (m *MockUserLimitRepository) Delete(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

type MockTierRepository struct {
	mock.Mock
}

func (m *MockTierRepository) Create(ctx context.Context, tier *domain.Tier) error {
	args := m.Called(ctx, tier)
	return args.Error(0)
}

func (m *MockTierRepository) GetByID(ctx context.Context, id string) (*domain.Tier, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Tier), args.Error(1)
}

func (m *MockTierRepository) GetByName(ctx context.Context, name string) (*domain.Tier, error) {
	args := m.Called(ctx, name)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Tier), args.Error(1)
}

func (m *MockTierRepository) Update(ctx context.Context, tier *domain.Tier) error {
	args := m.Called(ctx, tier)
	return args.Error(0)
}

func (m *MockTierRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockTierRepository) List(ctx context.Context) ([]*domain.Tier, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Tier), args.Error(1)
}

func (m *MockTierRepository) GetAll(ctx context.Context) ([]domain.Tier, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Tier), args.Error(1)
}

func (m *MockTierRepository) GetAllOrderedByPrice(ctx context.Context) ([]domain.Tier, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Tier), args.Error(1)
}

func TestUserService_CreateUser(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	tier := &domain.Tier{
		ID:          uuid.New().String(),
		Name:        "free",
		Description: "Free tier",
		IsFree:      true,
		Price:       0.0,
		CreatedAt:   time.Now(),
	}

	req := &CreateUserRequest{
		Email:    "test@example.com",
		Password: "password123",
		Name:     stringPtr("Test User"),
		TierName: "free",
	}

	// Настраиваем моки
	mockUserRepo.On("GetByEmail", mock.Anything, req.Email).Return(nil, assert.AnError)
	mockTierRepo.On("GetByName", mock.Anything, "free").Return(tier, nil)
	mockUserRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)
	mockUserLimitRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.UserLimit")).Return(nil)

	createdUser := &domain.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	mockUserRepo.On("GetByID", mock.Anything, mock.AnythingOfType("string")).Return(createdUser, nil)

	// Выполняем тест
	user, err := service.CreateUser(context.Background(), req)

	// Проверяем результат
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, req.Email, user.Email)
	assert.Equal(t, req.Name, user.Name)
	assert.Equal(t, domain.RoleCustomer, user.Role)

	// Проверяем, что все моки были вызваны
	mockUserRepo.AssertExpectations(t)
	mockUserLimitRepo.AssertExpectations(t)
	mockTierRepo.AssertExpectations(t)
}

func TestUserService_CreateUser_EmailExists(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	existingUser := &domain.User{
		ID:    uuid.New().String(),
		Email: "test@example.com",
	}

	req := &CreateUserRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	// Настраиваем мок - пользователь уже существует
	mockUserRepo.On("GetByEmail", mock.Anything, req.Email).Return(existingUser, nil)

	// Выполняем тест
	user, err := service.CreateUser(context.Background(), req)

	// Проверяем результат
	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Contains(t, err.Error(), "already exists")

	mockUserRepo.AssertExpectations(t)
}

func TestUserService_AuthenticateUser(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
		Role:         domain.RoleCustomer,
	}

	req := &LoginRequest{
		Email:    "test@example.com",
		Password: password,
	}

	// Настраиваем мок
	mockUserRepo.On("GetByEmail", mock.Anything, req.Email).Return(user, nil)

	// Выполняем тест
	authenticatedUser, err := service.AuthenticateUser(context.Background(), req)

	// Проверяем результат
	assert.NoError(t, err)
	assert.NotNil(t, authenticatedUser)
	assert.Equal(t, user.ID, authenticatedUser.ID)
	assert.Equal(t, user.Email, authenticatedUser.Email)

	mockUserRepo.AssertExpectations(t)
}

func TestUserService_AuthenticateUser_InvalidPassword(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.DefaultCost)

	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
		Role:         domain.RoleCustomer,
	}

	req := &LoginRequest{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}

	// Настраиваем мок
	mockUserRepo.On("GetByEmail", mock.Anything, req.Email).Return(user, nil)

	// Выполняем тест
	authenticatedUser, err := service.AuthenticateUser(context.Background(), req)

	// Проверяем результат
	assert.Error(t, err)
	assert.Nil(t, authenticatedUser)
	assert.Contains(t, err.Error(), "invalid credentials")

	mockUserRepo.AssertExpectations(t)
}

func TestUserService_UpdateUser(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	userID := uuid.New().String()
	tierID := uuid.New().String()

	existingUser := &domain.User{
		ID:    userID,
		Email: "old@example.com",
		Name:  stringPtr("Old Name"),
		Role:  domain.RoleCustomer,
	}

	tier := &domain.Tier{
		ID:   tierID,
		Name: "premium",
	}

	req := &UpdateUserRequest{
		Email:  "new@example.com",
		Name:   stringPtr("New Name"),
		TierID: tierID,
		Role:   rolePtr(domain.RoleAdmin),
	}

	updatedUser := &domain.User{
		ID:     userID,
		Email:  req.Email,
		Name:   req.Name,
		TierID: req.TierID,
		Role:   *req.Role,
	}

	// Настраиваем моки
	mockUserRepo.On("GetByID", mock.Anything, userID).Return(existingUser, nil).Once()
	mockUserRepo.On("GetByEmail", mock.Anything, req.Email).Return(nil, assert.AnError)
	mockTierRepo.On("GetByID", mock.Anything, tierID).Return(tier, nil)
	mockUserRepo.On("Update", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)
	mockUserRepo.On("GetByID", mock.Anything, userID).Return(updatedUser, nil).Once()

	// Выполняем тест
	user, err := service.UpdateUser(context.Background(), userID, req)

	// Проверяем результат
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, req.Email, user.Email)
	assert.Equal(t, req.Name, user.Name)
	assert.Equal(t, req.TierID, user.TierID)
	assert.Equal(t, *req.Role, user.Role)

	mockUserRepo.AssertExpectations(t)
	mockTierRepo.AssertExpectations(t)
}

func TestUserService_DeleteUser(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	userID := uuid.New().String()
	user := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	// Настраиваем моки
	mockUserRepo.On("GetByID", mock.Anything, userID).Return(user, nil)
	mockUserRepo.On("Delete", mock.Anything, userID).Return(nil)

	// Выполняем тест
	err := service.DeleteUser(context.Background(), userID)

	// Проверяем результат
	assert.NoError(t, err)

	mockUserRepo.AssertExpectations(t)
}

func TestUserService_ChangePassword(t *testing.T) {
	mockUserRepo := new(MockUserRepository)
	mockUserLimitRepo := new(MockUserLimitRepository)
	mockTierRepo := new(MockTierRepository)

	service := NewUserService(mockUserRepo, mockUserLimitRepo, mockTierRepo)

	userID := uuid.New().String()
	oldPassword := "oldpassword"
	newPassword := "newpassword"
	hashedOldPassword, _ := bcrypt.GenerateFromPassword([]byte(oldPassword), bcrypt.DefaultCost)

	user := &domain.User{
		ID:           userID,
		Email:        "test@example.com",
		PasswordHash: string(hashedOldPassword),
	}

	// Настраиваем моки
	mockUserRepo.On("GetByID", mock.Anything, userID).Return(user, nil)
	mockUserRepo.On("Update", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)

	// Выполняем тест
	err := service.ChangePassword(context.Background(), userID, oldPassword, newPassword)

	// Проверяем результат
	assert.NoError(t, err)

	mockUserRepo.AssertExpectations(t)
}

// Вспомогательные функции
func stringPtr(s string) *string {
	return &s
}

func rolePtr(r domain.UserRole) *domain.UserRole {
	return &r
}
