package repository

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"oneui-hub/internal/domain"
)

// Упрощенные модели для тестов SQLite (без ENUM типов)
type TestUser struct {
	ID           string `gorm:"type:varchar(36);primaryKey"`
	Email        string `gorm:"type:varchar(255);uniqueIndex;not null"`
	Name         string `gorm:"type:varchar(255)"`
	PasswordHash string `gorm:"type:varchar(255);not null"`
	TierID       string `gorm:"type:varchar(36);not null"`
	Role         string `gorm:"type:varchar(50);default:'customer'"`
	CreatedAt    int64  `gorm:"autoCreateTime"`
	UpdatedAt    int64  `gorm:"autoUpdateTime"`
}

func (TestUser) TableName() string {
	return "users"
}

type TestTier struct {
	ID          string  `gorm:"type:varchar(36);primaryKey"`
	Name        string  `gorm:"type:varchar(100);uniqueIndex;not null"`
	Description string  `gorm:"type:text"`
	IsFree      bool    `gorm:"default:false"`
	Price       float64 `gorm:"type:decimal(10,2);default:0.00"`
	CreatedAt   int64   `gorm:"autoCreateTime"`
	UpdatedAt   int64   `gorm:"autoUpdateTime"`
}

func (TestTier) TableName() string {
	return "tiers"
}

type TestUserLimit struct {
	UserID            string   `gorm:"type:varchar(36);primaryKey"`
	MonthlyTokenLimit *int64   `gorm:"type:bigint"`
	Balance           *float64 `gorm:"type:decimal(10,2);default:0.00"`
}

func (TestUserLimit) TableName() string {
	return "user_limits"
}

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	// Выполняем миграцию упрощенных моделей
	err = db.AutoMigrate(&TestUser{}, &TestTier{}, &TestUserLimit{})
	require.NoError(t, err)

	return db
}

func createTestTier(t *testing.T, db *gorm.DB) *TestTier {
	tier := &TestTier{
		ID:          uuid.New().String(),
		Name:        "Test Tier",
		Description: "Test tier description",
		IsFree:      true,
		Price:       0.0,
		CreatedAt:   time.Now().Unix(),
	}
	err := db.Create(tier).Error
	require.NoError(t, err)
	return tier
}

// Функции конвертации между domain и test моделями
func domainUserToTest(user *domain.User) *TestUser {
	return &TestUser{
		ID:           user.ID,
		Email:        user.Email,
		Name:         getStringValue(user.Name),
		PasswordHash: user.PasswordHash,
		TierID:       user.TierID,
		Role:         string(user.Role),
		CreatedAt:    user.CreatedAt.Unix(),
		UpdatedAt:    user.UpdatedAt.Unix(),
	}
}

func testUserToDomain(user *TestUser) *domain.User {
	name := &user.Name
	if user.Name == "" {
		name = nil
	}
	return &domain.User{
		ID:           user.ID,
		Email:        user.Email,
		Name:         name,
		PasswordHash: user.PasswordHash,
		TierID:       user.TierID,
		Role:         domain.UserRole(user.Role),
		CreatedAt:    time.Unix(user.CreatedAt, 0),
		UpdatedAt:    time.Unix(user.UpdatedAt, 0),
	}
}

func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// TestUserRepository адаптер для тестирования с SQLite
type TestUserRepository struct {
	db *gorm.DB
}

func NewTestUserRepository(db *gorm.DB) *TestUserRepository {
	return &TestUserRepository{db: db}
}

func (r *TestUserRepository) Create(ctx context.Context, user *domain.User) error {
	testUser := domainUserToTest(user)
	if err := r.db.WithContext(ctx).Create(testUser).Error; err != nil {
		return err
	}
	return nil
}

func (r *TestUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var testUser TestUser
	if err := r.db.WithContext(ctx).First(&testUser, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	return testUserToDomain(&testUser), nil
}

func (r *TestUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var testUser TestUser
	if err := r.db.WithContext(ctx).First(&testUser, "email = ?", email).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	return testUserToDomain(&testUser), nil
}

func (r *TestUserRepository) Update(ctx context.Context, user *domain.User) error {
	testUser := domainUserToTest(user)
	if err := r.db.WithContext(ctx).Save(testUser).Error; err != nil {
		return err
	}
	return nil
}

func (r *TestUserRepository) Delete(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&TestUser{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

func (r *TestUserRepository) List(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	var testUsers []TestUser
	query := r.db.WithContext(ctx)

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&testUsers).Error; err != nil {
		return nil, err
	}

	users := make([]*domain.User, len(testUsers))
	for i, testUser := range testUsers {
		users[i] = testUserToDomain(&testUser)
	}
	return users, nil
}

func TestUserRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err := repo.Create(context.Background(), user)
	assert.NoError(t, err)

	// Проверяем, что пользователь создан
	var count int64
	db.Model(&TestUser{}).Where("email = ?", user.Email).Count(&count)
	assert.Equal(t, int64(1), count)
}

func TestUserRepository_GetByID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	// Создаем тестового пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	testUser := domainUserToTest(user)
	err := db.Create(testUser).Error
	require.NoError(t, err)

	// Тестируем получение пользователя
	foundUser, err := repo.GetByID(context.Background(), user.ID)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, foundUser.ID)
	assert.Equal(t, user.Email, foundUser.Email)

	// Тестируем получение несуществующего пользователя
	_, err = repo.GetByID(context.Background(), "nonexistent")
	assert.Error(t, err)
}

func TestUserRepository_GetByEmail(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	// Создаем тестового пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	testUser := domainUserToTest(user)
	err := db.Create(testUser).Error
	require.NoError(t, err)

	// Тестируем получение пользователя по email
	foundUser, err := repo.GetByEmail(context.Background(), user.Email)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, foundUser.ID)
	assert.Equal(t, user.Email, foundUser.Email)

	// Тестируем получение несуществующего пользователя
	_, err = repo.GetByEmail(context.Background(), "nonexistent@example.com")
	assert.Error(t, err)
}

func TestUserRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	// Создаем тестового пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	testUser := domainUserToTest(user)
	err := db.Create(testUser).Error
	require.NoError(t, err)

	// Обновляем пользователя
	user.Email = "updated@example.com"
	user.Role = domain.RoleAdmin
	err = repo.Update(context.Background(), user)
	assert.NoError(t, err)

	// Проверяем, что изменения сохранены
	var updatedUser TestUser
	err = db.First(&updatedUser, "id = ?", user.ID).Error
	require.NoError(t, err)
	assert.Equal(t, "updated@example.com", updatedUser.Email)
	assert.Equal(t, string(domain.RoleAdmin), updatedUser.Role)
}

func TestUserRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	// Создаем тестового пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		TierID:       tier.ID,
		Role:         domain.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	testUser := domainUserToTest(user)
	err := db.Create(testUser).Error
	require.NoError(t, err)

	// Удаляем пользователя
	err = repo.Delete(context.Background(), user.ID)
	assert.NoError(t, err)

	// Проверяем, что пользователь удален
	var count int64
	db.Model(&TestUser{}).Where("id = ?", user.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestUserRepository_List(t *testing.T) {
	db := setupTestDB(t)
	repo := NewTestUserRepository(db)
	tier := createTestTier(t, db)

	// Создаем несколько тестовых пользователей
	users := []*domain.User{
		{
			ID:           uuid.New().String(),
			Email:        "user1@example.com",
			PasswordHash: "hashedpassword",
			TierID:       tier.ID,
			Role:         domain.RoleCustomer,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           uuid.New().String(),
			Email:        "user2@example.com",
			PasswordHash: "hashedpassword",
			TierID:       tier.ID,
			Role:         domain.RoleAdmin,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	// Создаем пользователей в базе
	for _, user := range users {
		testUser := domainUserToTest(user)
		err := db.Create(testUser).Error
		require.NoError(t, err)
	}

	// Тестируем получение всех пользователей
	foundUsers, err := repo.List(context.Background(), 0, 0)
	assert.NoError(t, err)
	assert.Len(t, foundUsers, 2)

	// Тестируем получение с лимитом
	foundUsers, err = repo.List(context.Background(), 1, 0)
	assert.NoError(t, err)
	assert.Len(t, foundUsers, 1)

	// Тестируем получение с offset
	foundUsers, err = repo.List(context.Background(), 0, 1)
	assert.NoError(t, err)
	assert.Len(t, foundUsers, 1)
}
