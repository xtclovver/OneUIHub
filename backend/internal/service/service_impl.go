package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
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
func (s *userService) Register(ctx context.Context, email, password string, tierID string) (*domain.User, error) {
	// Проверяем, существует ли пользователь с таким email
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, fmt.Errorf("пользователь с email %s уже существует", email)
	}

	// Хешируем пароль
	hashedPassword, err := s.hashPassword(password)
	if err != nil {
		return nil, err
	}

	// Проверяем существование тира
	tier, err := s.tierRepo.FindByID(ctx, tierID)
	if err != nil {
		return nil, err
	}
	if tier == nil {
		return nil, fmt.Errorf("тир с ID %s не найден", tierID)
	}

	// Создаем пользователя
	user := &domain.User{
		ID:           uuid.New().String(),
		Email:        email,
		PasswordHash: hashedPassword,
		TierID:       tierID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Сохраняем пользователя в БД
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
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
		return nil, err
	}

	return user, nil
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
func (s *userService) Login(ctx context.Context, email, password string) (string, error) {
	// Ищем пользователя по email
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("пользователь с email %s не найден", email)
	}

	// Проверяем пароль
	if !s.comparePasswords(user.PasswordHash, password) {
		return "", fmt.Errorf("неверный пароль")
	}

	// Генерируем JWT токен
	token, err := s.generateJWT(user.ID)
	if err != nil {
		return "", err
	}

	return token, nil
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

// UpdateProfile обновляет профиль пользователя
func (s *userService) UpdateProfile(ctx context.Context, userID string, user *domain.User) error {
	// Проверяем существование пользователя
	existingUser, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Обновляем данные пользователя
	user.ID = userID // Убеждаемся, что ID не изменится
	user.UpdatedAt = time.Now()

	return s.userRepo.Update(ctx, user)
}

// ListUsers возвращает список пользователей
func (s *userService) ListUsers(ctx context.Context, offset, limit int) ([]domain.User, int, error) {
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
func (s *tierService) CreateTier(ctx context.Context, tier *domain.Tier) error {
	// Проверяем, что тир с таким именем не существует
	tiers, err := s.tierRepo.List(ctx)
	if err != nil {
		return err
	}

	// Проверяем уникальность имени тира
	for _, existingTier := range tiers {
		if existingTier.Name == tier.Name {
			return fmt.Errorf("тир с названием %s уже существует", tier.Name)
		}
	}

	// Устанавливаем ID и дату создания
	tier.ID = uuid.New().String()
	tier.CreatedAt = time.Now()

	return s.tierRepo.Create(ctx, tier)
}

// GetTier возвращает тир по ID
func (s *tierService) GetTier(ctx context.Context, id string) (*domain.Tier, error) {
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
func (s *tierService) UpdateTier(ctx context.Context, tier *domain.Tier) error {
	// Проверяем существование тира
	existingTier, err := s.tierRepo.FindByID(ctx, tier.ID)
	if err != nil {
		return err
	}
	if existingTier == nil {
		return fmt.Errorf("тир с ID %s не найден", tier.ID)
	}

	// Если меняется имя, проверяем на уникальность
	if tier.Name != existingTier.Name {
		tiers, err := s.tierRepo.List(ctx)
		if err != nil {
			return err
		}

		for _, t := range tiers {
			if t.ID != tier.ID && t.Name == tier.Name {
				return fmt.Errorf("тир с названием %s уже существует", tier.Name)
			}
		}
	}

	return s.tierRepo.Update(ctx, tier)
}

// DeleteTier удаляет тир
func (s *tierService) DeleteTier(ctx context.Context, id string) error {
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
func (s *tierService) ListTiers(ctx context.Context) ([]domain.Tier, error) {
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

// GetCompany возвращает компанию по ID
func (s *companyService) GetCompany(ctx context.Context, id string) (*domain.Company, error) {
	company, err := s.companyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if company == nil {
		return nil, fmt.Errorf("компания с ID %s не найдена", id)
	}
	return company, nil
}

// ListCompanies возвращает список компаний
func (s *companyService) ListCompanies(ctx context.Context) ([]domain.Company, error) {
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

// GetModel возвращает модель по ID
func (s *modelService) GetModel(ctx context.Context, id string) (*domain.Model, error) {
	model, err := s.modelRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if model == nil {
		return nil, fmt.Errorf("модель с ID %s не найдена", id)
	}
	return model, nil
}

// ListModels возвращает список моделей
func (s *modelService) ListModels(ctx context.Context) ([]domain.Model, error) {
	return s.modelRepo.List(ctx)
}

// ListModelsByCompany возвращает список моделей компании
func (s *modelService) ListModelsByCompany(ctx context.Context, companyID string) ([]domain.Model, error) {
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
func (s *rateLimitService) CreateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error {
	// Проверяем существование модели
	model, err := s.modelRepo.FindByID(ctx, rateLimit.ModelID)
	if err != nil {
		return fmt.Errorf("ошибка при проверке существования модели: %w", err)
	}
	if model == nil {
		return fmt.Errorf("модель с ID %s не найдена", rateLimit.ModelID)
	}

	// Проверяем существование тира
	tier, err := s.tierRepo.FindByID(ctx, rateLimit.TierID)
	if err != nil {
		return fmt.Errorf("ошибка при проверке существования тира: %w", err)
	}
	if tier == nil {
		return fmt.Errorf("тир с ID %s не найден", rateLimit.TierID)
	}

	// Проверяем, не существует ли уже ограничение для этой пары модель-тир
	existingRateLimit, err := s.rateLimitRepo.FindByModelAndTier(ctx, rateLimit.ModelID, rateLimit.TierID)
	if err != nil {
		return fmt.Errorf("ошибка при проверке существования ограничения: %w", err)
	}
	if existingRateLimit != nil {
		return fmt.Errorf("ограничение для модели %s и тира %s уже существует", rateLimit.ModelID, rateLimit.TierID)
	}

	// Устанавливаем ID и даты
	rateLimit.ID = uuid.New().String()
	rateLimit.CreatedAt = time.Now()
	rateLimit.UpdatedAt = time.Now()

	return s.rateLimitRepo.Create(ctx, rateLimit)
}

// GetRateLimit возвращает ограничение запросов по ID
func (s *rateLimitService) GetRateLimit(ctx context.Context, id string) (*domain.RateLimit, error) {
	rateLimit, err := s.rateLimitRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if rateLimit == nil {
		return nil, fmt.Errorf("ограничение запросов с ID %s не найдено", id)
	}
	return rateLimit, nil
}

// GetRateLimitByModelAndTier возвращает ограничение запросов по модели и тиру
func (s *rateLimitService) GetRateLimitByModelAndTier(ctx context.Context, modelID, tierID string) (*domain.RateLimit, error) {
	rateLimit, err := s.rateLimitRepo.FindByModelAndTier(ctx, modelID, tierID)
	if err != nil {
		return nil, err
	}
	if rateLimit == nil {
		return nil, fmt.Errorf("ограничение для модели %s и тира %s не найдено", modelID, tierID)
	}
	return rateLimit, nil
}

// UpdateRateLimit обновляет ограничение запросов
func (s *rateLimitService) UpdateRateLimit(ctx context.Context, rateLimit *domain.RateLimit) error {
	// Проверяем существование ограничения
	existingRateLimit, err := s.rateLimitRepo.FindByID(ctx, rateLimit.ID)
	if err != nil {
		return err
	}
	if existingRateLimit == nil {
		return fmt.Errorf("ограничение запросов с ID %s не найдено", rateLimit.ID)
	}

	// Обновляем время изменения
	rateLimit.UpdatedAt = time.Now()

	return s.rateLimitRepo.Update(ctx, rateLimit)
}

// DeleteRateLimit удаляет ограничение запросов
func (s *rateLimitService) DeleteRateLimit(ctx context.Context, id string) error {
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
func (s *rateLimitService) ListRateLimits(ctx context.Context) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.List(ctx)
}

// ListRateLimitsByModel возвращает список ограничений запросов по модели
func (s *rateLimitService) ListRateLimitsByModel(ctx context.Context, modelID string) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.ListByModelID(ctx, modelID)
}

// ListRateLimitsByTier возвращает список ограничений запросов по тиру
func (s *rateLimitService) ListRateLimitsByTier(ctx context.Context, tierID string) ([]domain.RateLimit, error) {
	return s.rateLimitRepo.ListByTierID(ctx, tierID)
}

// CheckRateLimit проверяет ограничение запросов
func (s *rateLimitService) CheckRateLimit(ctx context.Context, userID, modelID string, inputTokens int) (bool, error) {
	// Получаем пользователя
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return false, fmt.Errorf("ошибка при получении данных пользователя: %w", err)
	}
	if user == nil {
		return false, fmt.Errorf("пользователь с ID %s не найден", userID)
	}

	// Получаем ограничение для модели и тира пользователя
	rateLimit, err := s.rateLimitRepo.FindByModelAndTier(ctx, modelID, user.TierID)
	if err != nil {
		return false, fmt.Errorf("ошибка при получении ограничений: %w", err)
	}

	// Если ограничений нет, разрешаем запрос
	if rateLimit == nil {
		return true, nil
	}

	// Реализация проверки ограничений на токены
	// В реальной системе здесь должна быть логика подсчета токенов
	// за определенные периоды времени (минута, день, месяц)
	// и сравнение с установленными лимитами
	if rateLimit.TokensPerMinute > 0 && inputTokens > rateLimit.TokensPerMinute {
		return false, fmt.Errorf("превышен лимит токенов в минуту (%d)", rateLimit.TokensPerMinute)
	}

	return true, nil
}

// List обрабатывает HTTP-запрос на получение всех ограничений
func (s *rateLimitService) List(w http.ResponseWriter, r *http.Request) {
	limits, err := s.ListRateLimits(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Ошибка при получении лимитов"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(limits)
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

// CreateApiKey создает новый ключ API
func (s *apiKeyService) CreateApiKey(ctx context.Context, userID string, name string, expiresAt *time.Time) (*domain.ApiKey, string, error) {
	// Генерируем время истечения, если не предоставлено
	expiry := time.Now().Add(24 * 7 * time.Hour) // По умолчанию 1 неделя
	if expiresAt != nil {
		expiry = *expiresAt
	}

	// Создаем ключ API через LiteLLM
	apiKey, err := s.litellmClient.CreateKey(ctx, userID, expiry)
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

// ListApiKeys возвращает список ключей API пользователя
func (s *apiKeyService) ListApiKeys(ctx context.Context, userID string) ([]domain.ApiKey, error) {
	return s.apiKeyRepo.FindByUserID(ctx, userID)
}

// DeleteApiKey удаляет ключ API
func (s *apiKeyService) DeleteApiKey(ctx context.Context, id string) error {
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

// CreateRequest создает новый запрос
func (s *requestService) CreateRequest(ctx context.Context, userID string, modelID string, inputTokens, outputTokens int) (*domain.Request, error) {
	// Получаем конфигурацию модели для расчета стоимости
	modelConfig, err := s.modelConfigRepo.FindByModelID(ctx, modelID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении конфигурации модели: %w", err)
	}
	if modelConfig == nil {
		return nil, fmt.Errorf("конфигурация для модели с ID %s не найдена", modelID)
	}

	// Рассчитываем стоимость запроса
	inputCost := float64(inputTokens) * modelConfig.InputTokenCost
	outputCost := float64(outputTokens) * modelConfig.OutputTokenCost
	totalCost := inputCost + outputCost

	// Создаем запрос
	request := &domain.Request{
		ID:           uuid.New().String(),
		UserID:       userID,
		ModelID:      modelID,
		InputTokens:  inputTokens,
		OutputTokens: outputTokens,
		InputCost:    inputCost,
		OutputCost:   outputCost,
		TotalCost:    totalCost,
		CreatedAt:    time.Now(),
	}

	// Сохраняем запрос
	if err := s.requestRepo.Create(ctx, request); err != nil {
		return nil, fmt.Errorf("ошибка при сохранении запроса: %w", err)
	}

	// Обновляем лимиты пользователя
	userLimits, err := s.userLimitsRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении лимитов пользователя: %w", err)
	}
	if userLimits != nil {
		// Вычитаем токены из лимита пользователя
		totalTokens := inputTokens + outputTokens
		if userLimits.MonthlyTokenLimit > 0 {
			userLimits.MonthlyTokenLimit -= int64(totalTokens)
			if userLimits.MonthlyTokenLimit < 0 {
				userLimits.MonthlyTokenLimit = 0
			}

			if err := s.userLimitsRepo.Update(ctx, userLimits); err != nil {
				return nil, fmt.Errorf("ошибка при обновлении лимитов пользователя: %w", err)
			}
		}
	}

	return request, nil
}

// GetRequest возвращает запрос по ID
func (s *requestService) GetRequest(ctx context.Context, id string) (*domain.Request, error) {
	request, err := s.requestRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if request == nil {
		return nil, fmt.Errorf("запрос с ID %s не найден", id)
	}
	return request, nil
}

// ListUserRequests возвращает список запросов пользователя
func (s *requestService) ListUserRequests(ctx context.Context, userID string, offset, limit int) ([]domain.Request, int, error) {
	requests, err := s.requestRepo.ListByUserID(ctx, userID, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.requestRepo.CountByUserID(ctx, userID)
	if err != nil {
		return nil, 0, err
	}

	return requests, total, nil
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
	allowed, err := s.rateLimitService.CheckRateLimit(ctx, userID, modelID, inputTokens)
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

	// Сохраняем информацию о запросе
	_, err = s.requestService.CreateRequest(ctx, userID, modelID, inputTokens, response.Tokens)
	if err != nil {
		// Логируем ошибку, но не прерываем выполнение
		// В реальной системе здесь должно быть логирование
		fmt.Printf("Ошибка при сохранении информации о запросе: %v\n", err)
	}

	return response, nil
}
