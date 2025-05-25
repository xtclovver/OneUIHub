package main

import (
	"log"

	"oneui-hub/internal/api/handlers"
	"oneui-hub/internal/api/routes"
	"oneui-hub/internal/config"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/middleware"
	"oneui-hub/internal/repository"
	"oneui-hub/internal/service"
	"oneui-hub/pkg/auth"
	"oneui-hub/pkg/database"
)

func main() {
	// Загружаем конфигурацию
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Подключаемся к базе данных
	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// // Выполняем миграции
	// if err := db.Migrate(); err != nil {
	// 	log.Fatalf("Failed to migrate database: %v", err)
	// }

	// Инициализируем JWT менеджер
	jwtManager := auth.NewJWTManager(cfg.Auth.JWTSecret, cfg.Auth.TokenDuration)

	// Инициализируем LiteLLM клиент
	litellmClient := litellm.NewClient(&cfg.LiteLLM)

	// Инициализируем репозитории
	userRepo := repository.NewUserRepository(db.DB)
	tierRepo := repository.NewTierRepository(db.DB)
	userLimitRepo := repository.NewUserLimitRepository(db.DB)
	modelRepo := repository.NewModelRepository(db.DB)
	companyRepo := repository.NewCompanyRepository(db.DB)
	budgetRepo := repository.NewBudgetRepository(db.DB)
	modelConfigRepo := repository.NewModelConfigRepository(db.DB)
	currencyRepo := repository.NewCurrencyRepository(db.DB)
	exchangeRateRepo := repository.NewExchangeRateRepository(db.DB)
	userSpendingRepo := repository.NewUserSpendingRepository(db.DB)

	// Инициализируем сервисы
	userService := service.NewUserService(userRepo, userLimitRepo, tierRepo)
	modelService := service.NewModelService(modelRepo, companyRepo, modelConfigRepo, litellmClient)
	budgetService := service.NewBudgetService(budgetRepo, userRepo, litellmClient)
	currencyService := service.NewCurrencyService(exchangeRateRepo, currencyRepo, "")
	tierService := service.NewTierService(tierRepo, userRepo, userSpendingRepo)

	// Инициализируем обработчики
	authHandler := handlers.NewAuthHandler(userService, jwtManager)
	modelHandler := handlers.NewModelHandler(modelService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)
	currencyHandler := handlers.NewCurrencyHandler(currencyService)
	tierHandler := handlers.NewTierHandler(tierService)

	// Инициализируем middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// Инициализируем маршруты
	router := routes.NewRouter(authHandler, modelHandler, budgetHandler, currencyHandler, tierHandler, authMiddleware)

	// Запускаем сервер
	engine := router.SetupRoutes()
	address := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", address)

	if err := engine.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
