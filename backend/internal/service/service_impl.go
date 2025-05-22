package service

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/litellm"
	"github.com/oneaihub/backend/internal/repository"
)

// userService реализация UserService
type userService struct {
	userRepo       repository.UserRepository
	tierRepo       repository.TierRepository
	userLimitsRepo repository.UserLimitsRepository
}

// NewUserService создает новый сервис пользователей
func NewUserService(
	userRepo repository.UserRepository,
	tierRepo repository.TierRepository,
	userLimitsRepo repository.UserLimitsRepository,
) UserService {
	return &userService{
		userRepo:       userRepo,
		tierRepo:       tierRepo,
		userLimitsRepo: userLimitsRepo,
	}
}

// Register регистрирует нового пользователя
func (s *userService) Register(ctx context.Context, input *domain.UserRegister) (*domain.UserResponse, string, error) {
	// Проверяем, существует ли пользователь с таким email
	existingUser, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", err
	}
	if existingUser != nil {
		return nil, "", fmt.Errorf("пользователь с email %s уже существует", input.Email)
	}

	// Хешируем пароль
	hashedPassword, err := s.hashPassword(input.Password)
	if err != nil {
		return nil, "", err
	}

	// TODO: Получить ID тира из базы данных
	defaultTierID := "free_tier_id"

	// Создаем пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        input.Email,
		PasswordHash: hashedPassword,
		TierID:       defaultTierID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Сохраняем пользователя в БД
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", err
	}

	// Создаем лимиты для пользователя
	userLimits := &domain.UserLimits{
		UserID:            user.ID,
		MonthlyTokenLimit: 0, // Будет установлено в зависимости от тира
		Balance:           0,
	}

	if err := s.userLimitsRepo.Create(ctx, userLimits); err != nil {
		// В случае ошибки, удаляем созданного пользователя
		_ = s.userRepo.Delete(ctx, user.ID)
		return nil, "", err
	}

	// Генерируем JWT токен
	token, err := s.generateJWT(user.ID)
	if err != nil {
		return nil, "", err
	}

	// Создаем ответ
	response := &domain.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		TierID:    user.TierID,
		CreatedAt: user.CreatedAt,
	}

	return response, token, nil
}

// hashPassword хеширует пароль
func (s *userService) hashPassword(password string) (string, error) {
	// В реальной реализации здесь должен быть безопасный алгоритм хеширования
	// Например, bcrypt, но для простоты использую SHA-256
	hasher := sha256.New()
	hasher.Write([]byte(password))
	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// comparePasswords сравнивает хеш пароля
func (s *userService) comparePasswords(hashedPassword, password string) bool {
	// Хешируем введенный пароль и сравниваем с сохраненным хешем
	hasher := sha256.New()
	hasher.Write([]byte(password))
	calculatedHash := hex.EncodeToString(hasher.Sum(nil))
	return calculatedHash == hashedPassword
}

// Login выполняет вход пользователя
func (s *userService) Login(ctx context.Context, input *domain.UserLogin) (*domain.UserResponse, string, error) {
	// Ищем пользователя по email
	user, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", fmt.Errorf("пользователь с email %s не найден", input.Email)
	}

	// Проверяем пароль
	if !s.comparePasswords(user.PasswordHash, input.Password) {
		return nil, "", fmt.Errorf("неверный пароль")
	}

	// Генерируем JWT токен
	token, err := s.generateJWT(user.ID)
	if err != nil {
		return nil, "", err
	}

	// Создаем ответ
	response := &domain.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		TierID:    user.TierID,
		CreatedAt: user.CreatedAt,
	}

	return response, token, nil
}

// generateJWT генерирует JWT токен
func (s *userService) generateJWT(userID string) (string, error) {
	// В реальной реализации здесь должна быть генерация JWT токена
	// с использованием библиотеки вроде github.com/golang-jwt/jwt
	// Для простоты возвращаем простую строку
	return "jwt_token_for_" + userID, nil
}

// GetProfile возвращает профиль пользователя
func (s *userService) GetProfile(ctx context.Context, userID string) (*domain.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", userID)
	}
	return user, nil
}

// Update обновляет профиль пользователя
func (s *userService) Update(ctx context.Context, id string, user *domain.User) (*domain.User, error) {
	// Проверяем существование пользователя
	existingUser, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingUser == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", id)
	}

	// Обновляем данные пользователя
	user.ID = id // Убеждаемся, что ID не изменится
	user.UpdatedAt = time.Now()

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// List возвращает список пользователей
func (s *userService) List(ctx context.Context, offset, limit int) ([]domain.User, int, error) {
	users, err := s.userRepo.List(ctx, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetUserLimits возвращает лимиты пользователя
func (s *userService) GetUserLimits(ctx context.Context, userID string) (*domain.UserLimits, error) {
	// Проверяем существование пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Получаем лимиты пользователя
	limits, err := s.userLimitsRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if limits == nil {
		return nil, fmt.Errorf("лимиты для пользователя с ID %s не найдены", userID)
	}

	return limits, nil
}

// ApproveFreeTier одобряет бесплатный ранг для пользователя
func (s *userService) ApproveFreeTier(ctx context.Context, userID string) error {
	// Находим пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Находим бесплатный тир
	tiers, err := s.tierRepo.List(ctx)
	if err != nil {
		return err
	}

	// Ищем бесплатный тир среди всех тиров
	var freeTier *domain.Tier
	for _, tier := range tiers {
		if tier.IsFree {
			freeTier = &tier
			break
		}
	}

	if freeTier == nil {
		return fmt.Errorf("бесплатный тир не найден")
	}

	// Обновляем пользователя
	user.TierID = freeTier.ID
	user.UpdatedAt = time.Now()

	return s.userRepo.Update(ctx, user)
}

// tierService реализация TierService
type tierService struct {
	tierRepo repository.TierRepository
}

// NewTierService создает новый сервис тиров
func NewTierService(tierRepo repository.TierRepository) TierService {
	return &tierService{
		tierRepo: tierRepo,
	}
}

// CreateTier создает новый тир
func (s *tierService) Create(ctx context.Context, tier *domain.Tier) (*domain.Tier, error) {
	// Проверяем, что тир с таким именем не существует
	tiers, err := s.tierRepo.List(ctx)
	if err != nil {
		return nil, err
	}

	// Проверяем уникальность имени тира
	for _, existingTier := range tiers {
		if existingTier.Name == tier.Name {
			return nil, fmt.Errorf("тир с названием %s уже существует", tier.Name)
		}
	}

	// Устанавливаем ID и дату создания
	tier.ID = uuid.New().String()
	tier.CreatedAt = time.Now()

	if err := s.tierRepo.Create(ctx, tier); err != nil {
		return nil, err
	}

	return tier, nil
}

// GetTier возвращает тир по ID
func (s *tierService) GetByID(ctx context.Context, id string) (*domain.Tier, error) {
	tier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if tier == nil {
		return nil, fmt.Errorf("тир с ID %s не найден", id)
	}
	return tier, nil
}

// UpdateTier обновляет тир
func (s *tierService) Update(ctx context.Context, id string, tier *domain.Tier) (*domain.Tier, error) {
	// Проверяем существование тира
	existingTier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingTier == nil {
		return nil, fmt.Errorf("тир с ID %s не найден", id)
	}

	// Если меняется имя, проверяем на уникальность
	if tier.Name != existingTier.Name {
		tiers, err := s.tierRepo.List(ctx)
		if err != nil {
			return nil, err
		}

		for _, t := range tiers {
			if t.ID != id && t.Name == tier.Name {
				return nil, fmt.Errorf("тир с названием %s уже существует", tier.Name)
			}
		}
	}

	tier.ID = id // Убеждаемся, что ID не изменится

	if err := s.tierRepo.Update(ctx, tier); err != nil {
		return nil, err
	}

	return tier, nil
}

// DeleteTier удаляет тир
func (s *tierService) Delete(ctx context.Context, id string) error {
	// Проверяем существование тира
	tier, err := s.tierRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if tier == nil {
		return fmt.Errorf("тир с ID %s не найден", id)
	}

	// TODO: Проверить, есть ли пользователи с этим тиром
	// Если есть, нужно запретить удаление или переместить их на другой тир

	return s.tierRepo.Delete(ctx, id)
}

// ListTiers возвращает список тиров
func (s *tierService) List(ctx context.Context) ([]domain.Tier, error) {
	return s.tierRepo.List(ctx)
}

// companyService реализация CompanyService
type companyService struct {
	companyRepo repository.CompanyRepository
}

// NewCompanyService создает новый сервис компаний
func NewCompanyService(companyRepo repository.CompanyRepository) CompanyService {
	return &companyService{
		companyRepo: companyRepo,
	}
}

// Create создает новую компанию
func (s *companyService) Create(ctx context.Context, input *domain.Company) (*domain.Company, error) {
	// Проверяем уникальность имени компании
	existingCompany, err := s.companyRepo.FindByName(ctx, input.Name)
	if err != nil {
		return nil, err
	}
	if existingCompany != nil {
		return nil, fmt.Errorf("компания с названием %s уже существует", input.Name)
	}

	// Устанавливаем ID и даты
	if input.ID == "" {
		input.ID = uuid.New().String()
	}

	now := time.Now()
	if input.CreatedAt.IsZero() {
		input.CreatedAt = now
	}

	input.UpdatedAt = now

	// Создаем компанию
	if err := s.companyRepo.Create(ctx, input); err != nil {
		return nil, err
	}

	return input, nil
}

// GetByID возвращает компанию по ID
func (s *companyService) GetByID(ctx context.Context, id string) (*domain.Company, error) {
	company, err := s.companyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if company == nil {
		return nil, fmt.Errorf("компания с ID %s не найдена", id)
	}
	return company, nil
}

// Update обновляет компанию
func (s *companyService) Update(ctx context.Context, id string, input *domain.Company) (*domain.Company, error) {
	// Проверяем существование компании
	existingCompany, err := s.companyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingCompany == nil {
		return nil, fmt.Errorf("компания с ID %s не найдена", id)
	}

	// Проверяем уникальность имени, если оно изменилось
	if input.Name != existingCompany.Name {
		company, err := s.companyRepo.FindByName(ctx, input.Name)
		if err != nil {
			return nil, err
		}
		if company != nil && company.ID != id {
			return nil, fmt.Errorf("компания с названием %s уже существует", input.Name)
		}
	}

	// Обновляем данные
	input.ID = id
	input.UpdatedAt = time.Now()

	if err := s.companyRepo.Update(ctx, input); err != nil {
		return nil, err
	}

	return input, nil
}

// Delete удаляет компанию
func (s *companyService) Delete(ctx context.Context, id string) error {
	// Проверяем существование компании
	company, err := s.companyRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if company == nil {
		return fmt.Errorf("компания с ID %s не найдена", id)
	}

	// Удаляем компанию
	return s.companyRepo.Delete(ctx, id)
}

// List возвращает список компаний
func (s *companyService) List(ctx context.Context) ([]domain.Company, error) {
	return s.companyRepo.List(ctx)
}

// modelService реализация ModelService
type modelService struct {
	modelRepo       repository.ModelRepository
	modelConfigRepo repository.ModelConfigRepository
}

// NewModelService создает новый сервис моделей
func NewModelService(
	modelRepo repository.ModelRepository,
	modelConfigRepo repository.ModelConfigRepository,
) ModelService {
	return &modelService{
		modelRepo:       modelRepo,
		modelConfigRepo: modelConfigRepo,
	}
}

// Create создает новую модель
func (s *modelService) Create(ctx context.Context, input *domain.Model) (*domain.Model, error) {
	// Проверяем уникальность имени модели
	existingModel, err := s.modelRepo.FindByName(ctx, input.Name)
	if err != nil {
		return nil, err
	}
	if existingModel != nil {
		return nil, fmt.Errorf("модель с названием %s уже существует", input.Name)
	}

	// Устанавливаем ID и даты
	if input.ID == "" {
		input.ID = uuid.New().String()
	}

	now := time.Now()
	if input.CreatedAt.IsZero() {
		input.CreatedAt = now
	}

	input.UpdatedAt = now

	// Создаем модель
	if err := s.modelRepo.Create(ctx, input); err != nil {
		return nil, err
	}

	return input, nil
}

// GetByID возвращает модель по ID
func (s *modelService) GetByID(ctx context.Context, id string) (*domain.Model, error) {
	model, err := s.modelRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", id)
	}
	return model, nil
}

// Update обновляет модель
func (s *modelService) Update(ctx context.Context, id string, input *domain.Model) (*domain.Model, error) {
	// Проверяем существование модели
	existingModel, err := s.modelRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingModel == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", id)
	}

	// Проверяем уникальность имени, если оно изменилось
	if input.Name != existingModel.Name {
		model, err := s.modelRepo.FindByName(ctx, input.Name)
		if err != nil {
			return nil, err
		}
		if model != nil && model.ID != id {
			return nil, fmt.Errorf("модель с названием %s уже существует", input.Name)
		}
	}

	// Обновляем данные
	input.ID = id
	input.UpdatedAt = time.Now()

	if err := s.modelRepo.Update(ctx, input); err != nil {
		return nil, err
	}

	return input, nil
}

// Delete удаляет модель
func (s *modelService) Delete(ctx context.Context, id string) error {
	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if model == nil {
		return fmt.Errorf("модель с ID %s не найдена", id)
	}

	// Удаляем модель
	return s.modelRepo.Delete(ctx, id)
}

// List возвращает список моделей
func (s *modelService) List(ctx context.Context) ([]domain.Model, error) {
	return s.modelRepo.List(ctx)
}

// ListByCompanyID возвращает список моделей компании
func (s *modelService) ListByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error) {
	return s.modelRepo.ListByCompanyID(ctx, companyID)
}

// GetModelConfig возвращает конфигурацию модели
func (s *modelService) GetModelConfig(ctx context.Context, modelID string) (*domain.ModelConfig, error) {
	config, err := s.modelConfigRepo.FindByModelID(ctx, modelID)
	if err != nil {
		return nil, err
	}
	if config == nil {
		return nil, fmt.Errorf("конфигурация для модели с ID %s не найдена", modelID)
	}
	return config, nil
}

// UpdateModelConfig обновляет конфигурацию модели
func (s *modelService) UpdateModelConfig(ctx context.Context, config *domain.ModelConfig) error {
	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, config.ModelID)
	if err != nil {
		return err
	}
	if model == nil {
		return fmt.Errorf("модель с ID %s не найдена", config.ModelID)
	}

	// Проверяем существование конфигурации
	existingConfig, err := s.modelConfigRepo.FindByID(ctx, config.ID)
	if err != nil {
		return err
	}
	if existingConfig == nil {
		return fmt.Errorf("конфигурация с ID %s не найдена", config.ID)
	}

	// Обновляем конфигурацию
	config.UpdatedAt = time.Now()
	return s.modelConfigRepo.Update(ctx, config)
}

// CreateModelConfig создает новую конфигурацию модели
func (s *modelService) CreateModelConfig(ctx context.Context, modelID string, isFree bool, isEnabled bool, inputTokenCost float64, outputTokenCost float64) (*domain.ModelConfig, error) {
	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, modelID)
	if err != nil {
		return nil, err
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", modelID)
	}

	// Проверяем, не существует ли уже конфигурация для этой модели
	existingConfig, err := s.modelConfigRepo.FindByModelID(ctx, modelID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	// Если конфигурация уже существует, возвращаем ошибку
	if existingConfig != nil {
		return nil, fmt.Errorf("конфигурация для модели с ID %s уже существует", modelID)
	}

	// Создаем новую конфигурацию
	config := &domain.ModelConfig{
		ID:              uuid.New().String(),
		ModelID:         modelID,
		IsFree:          isFree,
		IsEnabled:       isEnabled,
		InputTokenCost:  inputTokenCost,
		OutputTokenCost: outputTokenCost,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Сохраняем конфигурацию в БД
	if err := s.modelConfigRepo.Create(ctx, config); err != nil {
		return nil, err
	}

	return config, nil
}

// GetModelByID возвращает модель по ID
func (s *modelService) GetModelByID(ctx context.Context, id string) (*domain.Model, error) {
	return s.modelRepo.FindByID(ctx, id)
}

// GetAllModels возвращает все модели
func (s *modelService) GetAllModels(ctx context.Context) ([]domain.Model, error) {
	return s.modelRepo.List(ctx)
}

// GetAllCompanies возвращает все компании
func (s *modelService) GetAllCompanies(ctx context.Context) ([]domain.Company, error) {
	// Здесь нужно делегировать вызов к репозиторию компаний
	// В текущей реализации у modelService нет доступа к companyRepo,
	// поэтому этот метод может быть добавлен при необходимости
	return nil, fmt.Errorf("метод не реализован")
}

// GetModelsByCompanyID возвращает модели компании
func (s *modelService) GetModelsByCompanyID(ctx context.Context, companyID string) ([]domain.Model, error) {
	return s.modelRepo.ListByCompanyID(ctx, companyID)
}

// GetAllModelsWithConfigs возвращает все модели с конфигурациями
func (s *modelService) GetAllModelsWithConfigs(ctx context.Context) ([]domain.ModelWithConfig, error) {
	// Получаем все модели
	models, err := s.modelRepo.List(ctx)
	if err != nil {
		return nil, err
	}

	// Создаем массив для результата
	result := make([]domain.ModelWithConfig, 0, len(models))

	// Для каждой модели получаем ее конфигурацию
	for _, model := range models {
		config, err := s.modelConfigRepo.FindByModelID(ctx, model.ID)
		if err != nil {
			return nil, fmt.Errorf("ошибка при получении конфигурации для модели %s: %w", model.ID, err)
		}

		// Если конфигурация не найдена, создаем пустую
		if config == nil {
			config = &domain.ModelConfig{
				ModelID:         model.ID,
				IsFree:          false,
				IsEnabled:       false,
				InputTokenCost:  0,
				OutputTokenCost: 0,
			}
		}

		// Добавляем в результат
		result = append(result, domain.ModelWithConfig{
			Model:  model,
			Config: *config,
		})
	}

	return result, nil
}

// UpdateModelConfigParams обновляет параметры конфигурации модели
func (s *modelService) UpdateModelConfigParams(ctx context.Context, id string, isFree bool, isEnabled bool, inputTokenCost float64, outputTokenCost float64) (*domain.ModelConfig, error) {
	// Проверяем существование конфигурации
	config, err := s.modelConfigRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if config == nil {
		return nil, fmt.Errorf("конфигурация с ID %s не найдена", id)
	}

	// Обновляем параметры
	config.IsFree = isFree
	config.IsEnabled = isEnabled
	config.InputTokenCost = inputTokenCost
	config.OutputTokenCost = outputTokenCost
	config.UpdatedAt = time.Now()

	// Сохраняем изменения
	if err := s.modelConfigRepo.Update(ctx, config); err != nil {
		return nil, err
	}

	return config, nil
}

// rateLimitService реализация RateLimitService
type rateLimitService struct {
	rateLimitRepo repository.RateLimitRepository
	userRepo      repository.UserRepository
	modelRepo     repository.ModelRepository
	tierRepo      repository.TierRepository
}

// NewRateLimitService создает новый сервис ограничений запросов
func NewRateLimitService(
	rateLimitRepo repository.RateLimitRepository,
	userRepo repository.UserRepository,
	modelRepo repository.ModelRepository,
	tierRepo repository.TierRepository,
) RateLimitService {
	return &rateLimitService{
		rateLimitRepo: rateLimitRepo,
		userRepo:      userRepo,
		modelRepo:     modelRepo,
		tierRepo:      tierRepo,
	}
}

// CreateRateLimit создает новое ограничение запросов
func (s *rateLimitService) Create(ctx context.Context, rateLimit *domain.RateLimit) (*domain.RateLimit, error) {
	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, rateLimit.ModelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке существования модели: %w", err)
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", rateLimit.ModelID)
	}

	// Проверяем существование тира
	tier, err := s.tierRepo.FindByID(ctx, rateLimit.TierID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке существования тира: %w", err)
	}
	if tier == nil {
		return nil, fmt.Errorf("тир с ID %s не найден", rateLimit.TierID)
	}

	// Проверяем, не существует ли уже ограничение для этой пары модель-тир
	existingRateLimit, err := s.rateLimitRepo.FindByModelAndTier(ctx, rateLimit.ModelID, rateLimit.TierID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке существования ограничения: %w", err)
	}
	if existingRateLimit != nil {
		return nil, fmt.Errorf("ограничение для модели %s и тира %s уже существует", rateLimit.ModelID, rateLimit.TierID)
	}

	// Устанавливаем ID и даты
	rateLimit.ID = uuid.New().String()
	rateLimit.CreatedAt = time.Now()
	rateLimit.UpdatedAt = time.Now()

	if err := s.rateLimitRepo.Create(ctx, rateLimit); err != nil {
		return nil, err
	}

	return rateLimit, nil
}

// GetRateLimit возвращает ограничение запросов по ID
func (s *rateLimitService) GetByID(ctx context.Context, id string) (*domain.RateLimit, error) {
	rateLimit, err := s.rateLimitRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if rateLimit == nil {
		return nil, fmt.Errorf("ограничение запросов с ID %s не найдено", id)
	}
	return rateLimit, nil
}

// UpdateRateLimit обновляет ограничение запросов
func (s *rateLimitService) Update(ctx context.Context, id string, rateLimit *domain.RateLimit) (*domain.RateLimit, error) {
	// Проверяем существование ограничения
	existingRateLimit, err := s.rateLimitRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingRateLimit == nil {
		return nil, fmt.Errorf("ограничение запросов с ID %s не найдено", id)
	}

	// Обновляем время изменения
	rateLimit.ID = id
	rateLimit.UpdatedAt = time.Now()

	if err := s.rateLimitRepo.Update(ctx, rateLimit); err != nil {
		return nil, err
	}

	return rateLimit, nil
}

// DeleteRateLimit удаляет ограничение запросов
func (s *rateLimitService) Delete(ctx context.Context, id string) error {
	// Проверяем существование ограничения
	rateLimit, err := s.rateLimitRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if rateLimit == nil {
		return fmt.Errorf("ограничение запросов с ID %s не найдено", id)
	}

	return s.rateLimitRepo.Delete(ctx, id)
}

// ListRateLimits возвращает список ограничений запросов
func (s *rateLimitService) List(ctx context.Context) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.List(ctx)
}

// ListRateLimitsByModel возвращает список ограничений запросов по модели
func (s *rateLimitService) ListByModelID(ctx context.Context, modelID string) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.ListByModelID(ctx, modelID)
}

// ListRateLimitsByTier возвращает список ограничений запросов по тиру
func (s *rateLimitService) ListByTierID(ctx context.Context, tierID string) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.ListByTierID(ctx, tierID)
}

// CheckRateLimit проверяет ограничение запросов для проверки соответствия интерфейсу
func (s *rateLimitService) CheckLimit(ctx context.Context, userID, modelID string) (bool, error) {
	// Получаем пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("ошибка при получении данных пользователя: %w", err)
	}
	if user == nil {
		return false, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Получаем тир пользователя
	tier, err := s.tierRepo.FindByID(ctx, user.TierID)
	if err != nil {
		return false, fmt.Errorf("ошибка при получении данных тира: %w", err)
	}
	if tier == nil {
		return false, fmt.Errorf("тир с ID %s не найден", user.TierID)
	}

	// Получаем ограничения для данной модели и тира
	rateLimit, err := s.rateLimitRepo.FindByModelAndTier(ctx, modelID, user.TierID)
	if err != nil {
		return false, fmt.Errorf("ошибка при получении ограничений: %w", err)
	}
	if rateLimit == nil {
		return false, fmt.Errorf("ограничения для модели %s и тира %s не найдены", modelID, user.TierID)
	}

	// Здесь должна быть логика проверки текущих использованных токенов/запросов
	// и сравнение с лимитами. Для простоты будем возвращать true

	return true, nil
}

// apiKeyService реализация ApiKeyService
type apiKeyService struct {
	apiKeyRepo    repository.ApiKeyRepository
	litellmClient litellm.LiteLLMClient
}

// NewApiKeyService создает новый сервис API ключей
func NewApiKeyService(
	apiKeyRepo repository.ApiKeyRepository,
	litellmClient litellm.LiteLLMClient,
) ApiKeyService {
	return &apiKeyService{
		apiKeyRepo:    apiKeyRepo,
		litellmClient: litellmClient,
	}
}

// Create создает новый ключ API
func (s *apiKeyService) Create(ctx context.Context, userID, name string, expiresAt *string) (*domain.ApiKey, string, error) {
	// Обработка даты истечения
	var expiry *time.Time
	if expiresAt != nil && *expiresAt != "" {
		t, err := time.Parse(time.RFC3339, *expiresAt)
		if err != nil {
			return nil, "", fmt.Errorf("неверный формат даты истечения: %w", err)
		}
		expiry = &t
	} else {
		// По умолчанию 1 неделя
		t := time.Now().Add(24 * 7 * time.Hour)
		expiry = &t
	}

	// Создаем ключ API через LiteLLM
	apiKey, err := s.litellmClient.CreateKey(ctx, userID, *expiry)
	if err != nil {
		return nil, "", fmt.Errorf("ошибка создания ключа API: %w", err)
	}

	// Обновляем имя ключа
	apiKey.Name = name

	// Сохраняем ключ в БД
	if err := s.apiKeyRepo.Create(ctx, apiKey); err != nil {
		return nil, "", fmt.Errorf("ошибка сохранения ключа API: %w", err)
	}

	// В реальной реализации вернуть реальный ключ от LiteLLM
	// В это случае мы возвращаем заглушку
	return apiKey, "sk_" + apiKey.ID, nil
}

// GetApiKey возвращает ключ API по ID
func (s *apiKeyService) GetApiKey(ctx context.Context, id string) (*domain.ApiKey, error) {
	apiKey, err := s.apiKeyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if apiKey == nil {
		return nil, fmt.Errorf("ключ API с ID %s не найден", id)
	}
	return apiKey, nil
}

// ListByUser возвращает список ключей API пользователя
func (s *apiKeyService) ListByUser(ctx context.Context, userID string) ([]domain.ApiKey, error) {
	return s.apiKeyRepo.FindByUserID(ctx, userID)
}

// Delete удаляет ключ API
func (s *apiKeyService) Delete(ctx context.Context, id string) error {
	// Проверяем существование ключа
	apiKey, err := s.apiKeyRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if apiKey == nil {
		return fmt.Errorf("ключ API с ID %s не найден", id)
	}

	// TODO: Вызвать API LiteLLM для удаления ключа

	// Удаляем ключ из БД
	return s.apiKeyRepo.Delete(ctx, id)
}

// requestService реализация RequestService
type requestService struct {
	requestRepo     repository.RequestRepository
	modelConfigRepo repository.ModelConfigRepository
	userLimitsRepo  repository.UserLimitsRepository
}

// NewRequestService создает новый сервис запросов
func NewRequestService(
	requestRepo repository.RequestRepository,
	modelConfigRepo repository.ModelConfigRepository,
	userLimitsRepo repository.UserLimitsRepository,
) RequestService {
	return &requestService{
		requestRepo:     requestRepo,
		modelConfigRepo: modelConfigRepo,
		userLimitsRepo:  userLimitsRepo,
	}
}

// Create создает новый запрос
func (s *requestService) Create(ctx context.Context, request *domain.Request) error {
	// Проверяем, что у запроса есть ID
	if request.ID == "" {
		request.ID = uuid.New().String()
	}

	// Проверяем, что у запроса есть дата создания
	if request.CreatedAt.IsZero() {
		request.CreatedAt = time.Now()
	}

	// Сохраняем запрос
	return s.requestRepo.Create(ctx, request)
}

// GetByID возвращает запрос по ID
func (s *requestService) GetByID(ctx context.Context, id string) (*domain.Request, error) {
	request, err := s.requestRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if request == nil {
		return nil, fmt.Errorf("запрос с ID %s не найден", id)
	}
	return request, nil
}

// ListByUser возвращает список запросов пользователя
func (s *requestService) ListByUser(ctx context.Context, userID string, offset, limit int) ([]domain.Request, int, error) {
	requests, err := s.requestRepo.FindByUserID(ctx, userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	count, err := s.requestRepo.CountByUserID(ctx, userID)
	if err != nil {
		return nil, 0, err
	}

	return requests, count, nil
}

// llmProxyService реализация LLMProxyService
type llmProxyService struct {
	litellmClient    litellm.LiteLLMClient
	modelRepo        repository.ModelRepository
	modelConfigRepo  repository.ModelConfigRepository
	userRepo         repository.UserRepository
	rateLimitService RateLimitService
	requestService   RequestService
}

// NewLLMProxyService создает новый сервис проксирования LLM
func NewLLMProxyService(
	litellmClient litellm.LiteLLMClient,
	modelRepo repository.ModelRepository,
	modelConfigRepo repository.ModelConfigRepository,
	userRepo repository.UserRepository,
	rateLimitService RateLimitService,
	requestService RequestService,
) LLMProxyService {
	return &llmProxyService{
		litellmClient:    litellmClient,
		modelRepo:        modelRepo,
		modelConfigRepo:  modelConfigRepo,
		userRepo:         userRepo,
		rateLimitService: rateLimitService,
		requestService:   requestService,
	}
}

// ProxyRequest проксирует запрос к модели
func (s *llmProxyService) ProxyRequest(ctx context.Context, userID, modelID string, content string) (*domain.Response, error) {
	// Проверяем существование пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении данных пользователя: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении данных модели: %w", err)
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", modelID)
	}

	// Получаем конфигурацию модели
	modelConfig, err := s.modelConfigRepo.FindByModelID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении конфигурации модели: %w", err)
	}
	if modelConfig == nil {
		return nil, fmt.Errorf("конфигурация для модели с ID %s не найдена", modelID)
	}

	// Проверяем, включена ли модель
	if !modelConfig.IsEnabled {
		return nil, fmt.Errorf("модель %s отключена", model.Name)
	}

	// Примерная оценка количества токенов во входном тексте
	// В реальной реализации должен быть более точный алгоритм
	inputTokens := len(content) / 4 // Грубая оценка: 1 токен ~ 4 символа

	// Проверяем ограничения запросов
	allowed, err := s.rateLimitService.CheckLimit(ctx, userID, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке ограничений: %w", err)
	}
	if !allowed {
		return nil, fmt.Errorf("запрос отклонен из-за ограничений")
	}

	// Создаем запрос к модели
	request := &domain.Request{
		UserID:      userID,
		ModelID:     modelID,
		InputTokens: inputTokens,
	}

	// Отправляем запрос через LiteLLM
	response, err := s.litellmClient.ProxyRequest(ctx, model.ExternalID, request)
	if err != nil {
		return nil, fmt.Errorf("ошибка при выполнении запроса к модели: %w", err)
	}

	// Сохраняем запрос в историю
	request = &domain.Request{
		ID:           uuid.New().String(),
		UserID:       userID,
		ModelID:      modelID,
		InputTokens:  inputTokens,
		OutputTokens: response.Tokens,
		InputCost:    float64(inputTokens) * modelConfig.InputTokenCost,
		OutputCost:   float64(response.Tokens) * modelConfig.OutputTokenCost,
		TotalCost:    float64(inputTokens)*modelConfig.InputTokenCost + float64(response.Tokens)*modelConfig.OutputTokenCost,
		CreatedAt:    time.Now(),
	}

	if err := s.requestService.Create(ctx, request); err != nil {
		return nil, fmt.Errorf("ошибка при сохранении запроса: %w", err)
	}

	return response, nil
}

// Completions обрабатывает запросы к моделям
func (s *llmProxyService) Completions(ctx context.Context, userID, modelID string, request map[string]interface{}) (map[string]interface{}, error) {
	// Проверяем существование пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении данных пользователя: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении данных модели: %w", err)
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", modelID)
	}

	// Получаем конфигурацию модели
	modelConfig, err := s.modelConfigRepo.FindByModelID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении конфигурации модели: %w", err)
	}
	if modelConfig == nil {
		return nil, fmt.Errorf("конфигурация для модели с ID %s не найдена", modelID)
	}

	// Проверяем, включена ли модель
	if !modelConfig.IsEnabled {
		return nil, fmt.Errorf("модель %s отключена", model.Name)
	}

	// Примерная оценка количества токенов во входном тексте
	// В реальной реализации должен быть более точный алгоритм
	inputTokens := 0
	if content, ok := request["prompt"].(string); ok {
		inputTokens = len(content) / 4 // Грубая оценка: 1 токен ~ 4 символа
	}

	// Проверяем ограничения запросов
	allowed, err := s.rateLimitService.CheckLimit(ctx, userID, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке ограничений: %w", err)
	}
	if !allowed {
		return nil, fmt.Errorf("запрос отклонен из-за ограничений")
	}

	// Отправляем запрос через LiteLLM
	// Создаем копию запроса для передачи в LiteLLM
	litellmRequest := make(map[string]interface{})
	for k, v := range request {
		litellmRequest[k] = v
	}

	// Добавляем модель в запрос
	litellmRequest["model"] = model.ExternalID

	// Выполняем запрос
	response, err := s.litellmClient.ProxyCompletions(ctx, litellmRequest)
	if err != nil {
		return nil, fmt.Errorf("ошибка при выполнении запроса к модели: %w", err)
	}

	// Извлекаем количество токенов из ответа
	var outputTokens int
	if usage, ok := response["usage"].(map[string]interface{}); ok {
		if completion, ok := usage["completion_tokens"].(float64); ok {
			outputTokens = int(completion)
		}
	}

	// Сохраняем запрос в историю
	requestData := &domain.Request{
		ID:           uuid.New().String(),
		UserID:       userID,
		ModelID:      modelID,
		InputTokens:  inputTokens,
		OutputTokens: outputTokens,
		InputCost:    float64(inputTokens) * modelConfig.InputTokenCost,
		OutputCost:   float64(outputTokens) * modelConfig.OutputTokenCost,
		TotalCost:    float64(inputTokens)*modelConfig.InputTokenCost + float64(outputTokens)*modelConfig.OutputTokenCost,
		CreatedAt:    time.Now(),
	}

	if err := s.requestService.Create(ctx, requestData); err != nil {
		// Логируем ошибку, но не прерываем выполнение
		fmt.Printf("Ошибка при сохранении запроса: %v\n", err)
	}

	return response, nil
}

// Delete удаляет пользователя
func (s *userService) Delete(ctx context.Context, id string) error {
	// Проверяем существование пользователя
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return fmt.Errorf("пользователь с ID %s не найден", id)
	}

	// Удаляем пользователя
	return s.userRepo.Delete(ctx, id)
}

// GetByID возвращает пользователя по ID
func (s *userService) GetByID(ctx context.Context, id string) (*domain.User, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", id)
	}
	return user, nil
}

// GetLimits возвращает лимиты пользователя
func (s *userService) GetLimits(ctx context.Context, userID string) (*domain.UserLimits, error) {
	// Проверяем существование пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Получаем лимиты пользователя
	limits, err := s.userLimitsRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if limits == nil {
		return nil, fmt.Errorf("лимиты для пользователя с ID %s не найдены", userID)
	}

	return limits, nil
}
