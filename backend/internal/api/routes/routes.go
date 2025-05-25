package routes

import (
	"github.com/gin-gonic/gin"

	"oneui-hub/internal/api/handlers"
	"oneui-hub/internal/middleware"
)

type Router struct {
	authHandler    *handlers.AuthHandler
	authMiddleware *middleware.AuthMiddleware
}

func NewRouter(
	authHandler *handlers.AuthHandler,
	authMiddleware *middleware.AuthMiddleware,
) *Router {
	return &Router{
		authHandler:    authHandler,
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
		// Здесь будут административные маршруты
	}

	return router
}
