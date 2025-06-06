package routes

import (
	"github.com/gin-gonic/gin"

	"oneui-hub/internal/api/handlers"
	"oneui-hub/internal/middleware"
)

type Router struct {
	authHandler         *handlers.AuthHandler
	modelHandler        *handlers.ModelHandler
	companyHandler      *handlers.CompanyHandler
	budgetHandler       *handlers.BudgetHandler
	currencyHandler     *handlers.CurrencyHandler
	tierHandler         *handlers.TierHandler
	userHandler         *handlers.UserHandler
	rateLimitHandler    *handlers.RateLimitHandler
	uploadHandler       *handlers.UploadHandler
	litellmAdminHandler *handlers.LiteLLMAdminHandler
	// settingsHandler *handlers.SettingsHandler
	authMiddleware *middleware.AuthMiddleware
}

func NewRouter(
	authHandler *handlers.AuthHandler,
	modelHandler *handlers.ModelHandler,
	companyHandler *handlers.CompanyHandler,
	budgetHandler *handlers.BudgetHandler,
	currencyHandler *handlers.CurrencyHandler,
	tierHandler *handlers.TierHandler,
	userHandler *handlers.UserHandler,
	rateLimitHandler *handlers.RateLimitHandler,
	uploadHandler *handlers.UploadHandler,
	litellmAdminHandler *handlers.LiteLLMAdminHandler,
	// settingsHandler *handlers.SettingsHandler,
	authMiddleware *middleware.AuthMiddleware,
) *Router {
	return &Router{
		authHandler:         authHandler,
		modelHandler:        modelHandler,
		companyHandler:      companyHandler,
		budgetHandler:       budgetHandler,
		currencyHandler:     currencyHandler,
		tierHandler:         tierHandler,
		userHandler:         userHandler,
		rateLimitHandler:    rateLimitHandler,
		uploadHandler:       uploadHandler,
		litellmAdminHandler: litellmAdminHandler,
		// settingsHandler: settingsHandler,
		authMiddleware: authMiddleware,
	}
}

func (r *Router) SetupRoutes() *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "oneui-hub-backend",
		})
	})

	// Статические файлы для загруженных логотипов
	router.Static("/uploads", "./uploads")

	// API группа
	api := router.Group("/api/v1")

	// Публичные маршруты
	auth := api.Group("/auth")
	{
		auth.POST("/register", r.authHandler.Register)
		auth.POST("/login", r.authHandler.Login)
		auth.POST("/refresh", r.authHandler.RefreshToken)
	}

	// Защищенные маршруты
	protected := api.Group("/")
	protected.Use(r.authMiddleware.RequireAuth())
	{
		protected.GET("/me", r.authHandler.Me)
	}

	// Административные маршруты
	admin := api.Group("/admin")
	admin.Use(r.authMiddleware.RequireAuth())
	admin.Use(r.authMiddleware.RequireAdmin())
	{
		// Маршруты для загрузки файлов
		upload := admin.Group("/upload")
		{
			upload.POST("/logo", r.uploadHandler.UploadLogo)
			upload.DELETE("/logo", r.uploadHandler.DeleteLogo)
		}

		// Маршруты для управления моделями
		models := admin.Group("/models")
		{
			// Синхронизация с LiteLLM
			models.POST("/sync", r.modelHandler.SyncFromLiteLLM)
			models.POST("/sync-model-group", r.modelHandler.SyncFromModelGroup)

			// CRUD операции для моделей в БД
			models.GET("", r.modelHandler.GetAllModels)
			models.GET("/:id", r.modelHandler.GetModelByID)
			models.POST("", r.modelHandler.CreateModel)
			models.PUT("/:id", r.modelHandler.UpdateModel)
			models.DELETE("/:id", r.modelHandler.DeleteModel)

			// Работа с LiteLLM API
			models.GET("/litellm", r.modelHandler.GetLiteLLMModels)
			models.GET("/litellm/:model_id", r.modelHandler.GetLiteLLMModelInfo)
			models.GET("/litellm/model-group", r.modelHandler.GetModelGroupInfo)
			models.POST("/litellm", r.modelHandler.CreateLiteLLMModel)
			models.PUT("/litellm", r.modelHandler.UpdateLiteLLMModel)
			models.DELETE("/litellm/:model_id", r.modelHandler.DeleteLiteLLMModel)
		}

		// Маршруты для управления бюджетами
		budgets := admin.Group("/budgets")
		{
			// Синхронизация с LiteLLM
			budgets.POST("/sync", r.budgetHandler.SyncFromLiteLLM)

			// CRUD операции для бюджетов в БД
			budgets.GET("", r.budgetHandler.GetAllBudgets)
			budgets.GET("/:id", r.budgetHandler.GetBudgetByID)
			budgets.GET("/user/:user_id", r.budgetHandler.GetBudgetsByUserID)
			budgets.POST("", r.budgetHandler.CreateBudget)
			budgets.PUT("/:id", r.budgetHandler.UpdateBudget)
			budgets.DELETE("/:id", r.budgetHandler.DeleteBudget)

			// Работа с LiteLLM API
			budgets.GET("/litellm", r.budgetHandler.GetLiteLLMBudgets)
			budgets.GET("/litellm/:budget_id", r.budgetHandler.GetLiteLLMBudgetInfo)
			budgets.GET("/litellm/settings", r.budgetHandler.GetLiteLLMBudgetSettings)
			budgets.POST("/litellm", r.budgetHandler.CreateLiteLLMBudget)
			budgets.PUT("/litellm", r.budgetHandler.UpdateLiteLLMBudget)
			budgets.DELETE("/litellm/:budget_id", r.budgetHandler.DeleteLiteLLMBudget)
		}

		// Маршруты для управления компаниями
		companies := admin.Group("/companies")
		{
			// Синхронизация с LiteLLM
			companies.POST("/sync", r.companyHandler.SyncCompaniesFromLiteLLM)

			// CRUD операции для компаний
			companies.GET("", r.companyHandler.GetAllCompanies)
			companies.GET("/:id", r.companyHandler.GetCompanyByID)
			companies.POST("", r.companyHandler.CreateCompany)
			companies.PUT("/:id", r.companyHandler.UpdateCompany)
			companies.DELETE("/:id", r.companyHandler.DeleteCompany)
		}

		// Маршруты для управления тарифами
		tiers := admin.Group("/tiers")
		{
			tiers.GET("", r.tierHandler.GetAllTiers)
			tiers.GET("/:id", r.tierHandler.GetTierByID)
			tiers.POST("", r.tierHandler.CreateTier)
			tiers.PUT("/:id", r.tierHandler.UpdateTier)
			tiers.DELETE("/:id", r.tierHandler.DeleteTier)
		}

		// Маршруты для управления лимитами
		rateLimits := admin.Group("/rate-limits")
		{
			rateLimits.GET("", r.rateLimitHandler.GetAllRateLimits)
			rateLimits.GET("/:id", r.rateLimitHandler.GetRateLimitByID)
			rateLimits.POST("", r.rateLimitHandler.CreateRateLimit)
			rateLimits.PUT("/:id", r.rateLimitHandler.UpdateRateLimit)
			rateLimits.DELETE("/:id", r.rateLimitHandler.DeleteRateLimit)
			rateLimits.GET("/model/:model_id", r.rateLimitHandler.GetRateLimitsByModel)
			rateLimits.GET("/tier/:tier_id", r.rateLimitHandler.GetRateLimitsByTier)
		}

		// Маршруты для управления настройками
		// settings := admin.Group("/settings")
		// {
		// 	settings.GET("", r.settingsHandler.GetAllSettings)
		// 	settings.GET("/category/:category", r.settingsHandler.GetSettingsByCategory)
		// 	settings.GET("/:key", r.settingsHandler.GetSetting)
		// 	settings.PUT("", r.settingsHandler.UpdateSettings)
		// 	settings.PUT("/:key", r.settingsHandler.UpdateSetting)
		// }

		// Маршруты для управления валютами
		currencies := admin.Group("/currencies")
		{
			currencies.POST("/update-rates", r.currencyHandler.UpdateExchangeRates)
		}

		// Маршруты для LiteLLM админских функций
		litellm := admin.Group("/litellm")
		{
			// Модели
			litellm.GET("/models/group-info", r.litellmAdminHandler.GetModelGroupInfo)
			litellm.GET("/models/info", r.litellmAdminHandler.GetModelsInfo)
			litellm.POST("/models", r.litellmAdminHandler.CreateModel)
			litellm.PUT("/models", r.litellmAdminHandler.UpdateModel)
			litellm.DELETE("/models/:model_id", r.litellmAdminHandler.DeleteModel)

			// Пользователи и ключи
			litellm.GET("/users/info", r.litellmAdminHandler.GetUserInfo)
			litellm.POST("/users/keys", r.litellmAdminHandler.CreateUserKey)
			litellm.PUT("/users/keys/:key_id", r.litellmAdminHandler.UpdateUserKey)
			litellm.DELETE("/users/keys/:key_id", r.litellmAdminHandler.DeleteUserKey)

			// Статистика и аналитика
			litellm.GET("/global/spend", r.litellmAdminHandler.GetGlobalSpend)
			litellm.GET("/global/spend/logs", r.litellmAdminHandler.GetSpendLogs)
			litellm.GET("/global/activity", r.litellmAdminHandler.GetGlobalActivity)
			litellm.GET("/admin/stats", r.litellmAdminHandler.GetAdminStats)
		}
	}

	// Публичные маршруты для валют
	currencies := api.Group("/currencies")
	{
		currencies.GET("", r.currencyHandler.GetSupportedCurrencies)
		currencies.GET("/exchange-rates", r.currencyHandler.GetExchangeRates)
		currencies.POST("/convert", r.currencyHandler.ConvertCurrency)
		currencies.POST("/update-rates", r.currencyHandler.UpdateExchangeRates)
	}

	// Публичные маршруты для компаний
	companies := api.Group("/companies")
	{
		companies.GET("", r.companyHandler.GetAllCompanies)
		companies.GET("/:id", r.companyHandler.GetCompanyByID)
		companies.GET("/:id/models", r.companyHandler.GetCompanyModels)
	}

	// Публичные маршруты для моделей
	models := api.Group("/models")
	{
		models.GET("", r.modelHandler.GetAllModels)
		models.GET("/:id", r.modelHandler.GetModelByID)
	}

	// Маршруты для тарифов
	tiers := api.Group("/tiers")
	{
		tiers.GET("", r.tierHandler.GetAllTiers)
	}

	// Публичные маршруты для лимитов
	rateLimits := api.Group("/rate-limits")
	{
		rateLimits.GET("", r.rateLimitHandler.GetAllRateLimits)
	}

	// Защищенные маршруты для пользователей
	users := protected.Group("/users")
	{
		// Тарифы и обновления тарифов
		users.GET("/:user_id/tier", r.tierHandler.GetUserTier)
		users.POST("/:user_id/tier/check", r.tierHandler.CheckAndUpgradeTier)

		// Данные из LiteLLM
		users.GET("/:user_id/spending", r.userHandler.GetUserSpending)
		users.GET("/:user_id/budget", r.userHandler.GetUserBudget)
		users.PUT("/:user_id/budget", r.userHandler.UpdateUserBudget)
		users.GET("/:user_id/usage-stats", r.userHandler.GetUsageStats)
		users.GET("/:user_id/requests", r.userHandler.GetRequestHistory)

		// API ключи
		users.GET("/:user_id/api-keys", r.userHandler.GetUserApiKeys)
		users.POST("/:user_id/api-keys", r.userHandler.CreateUserApiKey)
	}

	// Маршруты для управления API ключами
	apiKeys := protected.Group("/api-keys")
	{
		apiKeys.DELETE("/:key_id", r.userHandler.DeleteUserApiKey)
	}

	return router
}
