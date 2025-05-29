package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// UploadLogo загружает логотип компании
func (h *UploadHandler) UploadLogo(c *gin.Context) {
	// Получаем файл из формы
	file, header, err := c.Request.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл не найден"})
		return
	}
	defer file.Close()

	// Проверяем тип файла
	filename := header.Filename
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".png" && ext != ".svg" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Поддерживаются только файлы .png и .svg"})
		return
	}

	// Проверяем размер файла (максимум 5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Размер файла не должен превышать 5MB"})
		return
	}

	// Создаем директорию для загрузок если её нет
	uploadDir := "uploads/logos"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания директории"})
		return
	}

	// Генерируем уникальное имя файла
	newFilename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	filePath := filepath.Join(uploadDir, newFilename)

	// Создаем файл на диске
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания файла"})
		return
	}
	defer dst.Close()

	// Копируем содержимое
	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
		return
	}

	// Возвращаем URL файла
	fileURL := fmt.Sprintf("/uploads/logos/%s", newFilename)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Файл успешно загружен",
		"data": gin.H{
			"url": fileURL,
		},
	})
}

// DeleteLogo удаляет логотип
func (h *UploadHandler) DeleteLogo(c *gin.Context) {
	logoURL := c.Query("url")
	if logoURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL логотипа не указан"})
		return
	}

	// Извлекаем имя файла из URL
	if !strings.HasPrefix(logoURL, "/uploads/logos/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный URL логотипа"})
		return
	}

	filename := strings.TrimPrefix(logoURL, "/uploads/logos/")
	filePath := filepath.Join("uploads/logos", filename)

	// Удаляем файл
	if err := os.Remove(filePath); err != nil {
		// Если файл не существует, это не ошибка
		if !os.IsNotExist(err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления файла"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Логотип успешно удален",
	})
}
