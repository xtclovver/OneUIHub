package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/oneaihub/backend/internal/api"
	"github.com/oneaihub/backend/internal/config"
	"github.com/oneaihub/backend/internal/litellm"
	"github.com/oneaihub/backend/internal/repository"
	"github.com/oneaihub/backend/internal/service"
)

func main() {
	// Инициализация логгера
	logger := log.New(os.Stdout, "OneAIHub: ", log.LstdFlags|log.Lshortfile)

	// Загрузка конфигурации
	cfg, err := config.New()
	if err != nil {
		logger.Fatalf("Ошибка загрузки конфигурации: %v", err)
	}

	// Подключение к базе данных
	dsn := cfg.Database.GetDSN()
	db, err := sqlx.Connect("mysql", dsn)
	if err != nil {
		logger.Fatalf("Ошибка подключения к базе данных: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			logger.Printf("Ошибка закрытия соединения с базой данных: %v", err)
		}
	}()

	// Настройка базы данных
	db.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	db.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)

	// Проверка соединения с базой данных
	if err := db.Ping(); err != nil {
		logger.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	logger.Println("Успешное подключение к базе данных")

	// Инициализация LiteLLM клиента
	litellmClient := litellm.NewLiteLLMClient(cfg.LiteLLM.BaseURL, cfg.LiteLLM.APIKey)

	// Инициализация репозиториев
	userRepo := repository.NewUserRepository(db)
	tierRepo := repository.NewTierRepository(db)
	companyRepo := repository.NewCompanyRepository(db)
	modelRepo := repository.NewModelRepository(db)
	modelConfigRepo := repository.NewModelConfigRepository(db)
	rateLimitRepo := repository.NewRateLimitRepository(db)
	apiKeyRepo := repository.NewApiKeyRepository(db)
	requestRepo := repository.NewRequestRepository(db)
	userLimitsRepo := repository.NewUserLimitsRepository(db)

	// Инициализация сервисов
	modelSyncService := service.NewModelSyncService(
		litellmClient,
		modelRepo,
		companyRepo,
		modelConfigRepo,
	)

	userService := service.NewUserService(userRepo, tierRepo, userLimitsRepo)
	tierService := service.NewTierService(tierRepo)
	companyService := service.NewCompanyService(companyRepo)
	modelService := service.NewModelService(modelRepo, modelConfigRepo)
	rateLimitService := service.NewRateLimitService(rateLimitRepo, userRepo, modelRepo, tierRepo)
	apiKeyService := service.NewApiKeyService(apiKeyRepo, litellmClient)
	requestService := service.NewRequestService(requestRepo, modelConfigRepo, userLimitsRepo)
	llmProxyService := service.NewLLMProxyService(
		litellmClient,
		modelRepo,
		modelConfigRepo,
		userRepo,
		rateLimitService,
		requestService,
	)

	// Инициализация обработчиков API
	userHandler := api.NewUserHandler(userService)
	authHandler := api.NewAuthHandler(userService)
	tierHandler := api.NewTierHandler(tierService)
	companyHandler := api.NewCompanyHandler(companyService)
	modelHandler := api.NewModelHandler(modelService)
	apiKeyHandler := api.NewApiKeyHandler(apiKeyService)
	requestHandler := api.NewRequestHandler(requestService)
	adminHandler := api.NewAdminHandler(
		userService,
		tierService,
		modelService,
		rateLimitService,
		modelSyncService,
	)
	llmProxyHandler := api.NewLLMProxyHandler(llmProxyService)

	// Инициализация маршрутов
	router := chi.NewRouter()

	// Глобальные middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RealIP)
	router.Use(middleware.Timeout(60 * time.Second))

	// CORS middleware
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // В продакшне заменить на конкретные домены
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Публичные маршруты
	router.Group(func(r chi.Router) {
		r.Get("/api/companies", companyHandler.List)
		r.Get("/api/companies/{id}/models", modelHandler.ListByCompany)
		r.Get("/api/models", modelHandler.List)
		r.Get("/api/models/{id}", modelHandler.Get)
		r.Get("/api/tiers", tierHandler.List)
		r.Get("/api/rate-limits", adminHandler.ListRateLimits)

		// Аутентификация
		r.Post("/api/auth/register", authHandler.Register)
		r.Post("/api/auth/login", authHandler.Login)
	})

	// Пользовательские маршруты (требуют аутентификации)
	router.Group(func(r chi.Router) {
		// TODO: Добавить middleware аутентификации
		r.Get("/api/profile", userHandler.GetProfile)
		r.Get("/api/profile/limits", userHandler.GetLimits)
		r.Get("/api/requests", requestHandler.ListByUser)
		r.Post("/api/keys", apiKeyHandler.Create)
		r.Get("/api/keys", apiKeyHandler.ListByUser)
		r.Delete("/api/keys/{id}", apiKeyHandler.Delete)
	})

	// Административные маршруты
	router.Group(func(r chi.Router) {
		// TODO: Добавить middleware для проверки прав администратора
		r.Get("/api/admin/users", adminHandler.ListUsers)
		r.Post("/api/admin/users", adminHandler.CreateUser)
		r.Put("/api/admin/users/{id}", adminHandler.UpdateUser)
		r.Delete("/api/admin/users/{id}", adminHandler.DeleteUser)

		r.Get("/api/admin/models", adminHandler.ListModels)
		r.Put("/api/admin/model-configs/{id}", adminHandler.UpdateModelConfig)

		r.Get("/api/admin/tiers", adminHandler.ListTiers)
		r.Post("/api/admin/tiers", adminHandler.CreateTier)
		r.Put("/api/admin/tiers/{id}", adminHandler.UpdateTier)
		r.Delete("/api/admin/tiers/{id}", adminHandler.DeleteTier)

		r.Get("/api/admin/rate-limits", adminHandler.ListRateLimits)
		r.Post("/api/admin/rate-limits", adminHandler.CreateRateLimit)
		r.Put("/api/admin/rate-limits/{id}", adminHandler.UpdateRateLimit)
		r.Delete("/api/admin/rate-limits/{id}", adminHandler.DeleteRateLimit)

		r.Post("/api/admin/approve/{userId}", adminHandler.ApproveFreeTier)
		r.Post("/api/admin/sync/models", adminHandler.SyncModels)
		r.Post("/api/admin/sync/companies", adminHandler.SyncCompanies)
	})

	// LLM Proxy маршруты
	router.Group(func(r chi.Router) {
		// TODO: Добавить middleware аутентификации
		r.Post("/api/llm/completions", llmProxyHandler.Completions)
	})

	// Создание HTTP сервера
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  120 * time.Second,
	}

	// Запуск сервера в отдельной горутине
	go func() {
		logger.Printf("Сервер запущен на порту %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Ошибка запуска сервера: %v", err)
		}
	}()

	// Настройка graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Println("Получен сигнал завершения работы, закрытие соединений...")

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatalf("Ошибка при graceful shutdown: %v", err)
	}

	logger.Println("Сервер успешно остановлен")
}
