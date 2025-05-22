package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/oneaihub/backend/internal/domain"
	"github.com/oneaihub/backend/internal/service"
)

// AuthHandlerImpl представляет обработчики запросов для авторизации
type AuthHandlerImpl struct {
	authService service.AuthService
}

// NewAuthHandlerImpl создает новый обработчик авторизации
func NewAuthHandlerImpl(authService service.AuthService) *AuthHandlerImpl {
	return &AuthHandlerImpl{
		authService: authService,
	}
}

// Register обрабатывает запрос на регистрацию
func (h *AuthHandlerImpl) Register(w http.ResponseWriter, r *http.Request) {
	var input domain.UserRegister

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, token, err := h.authService.Register(r.Context(), &input)
	if err != nil {
		// Проверка на существующего пользователя
		if err.Error() == "user with this email already exists" {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

// Login обрабатывает запрос на вход
func (h *AuthHandlerImpl) Login(w http.ResponseWriter, r *http.Request) {
	var input domain.UserLogin

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, token, err := h.authService.Login(r.Context(), &input)
	if err != nil {
		// Неверные учетные данные
		if err.Error() == "invalid email or password" {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

// RegisterAuthRoutesImpl регистрирует маршруты аутентификации
func RegisterAuthRoutesImpl(router chi.Router, authHandler *AuthHandlerImpl) {
	router.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})
}
