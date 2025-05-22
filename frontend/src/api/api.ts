import axios from 'axios';

// Базовый URL для API запросов
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если статус 401 (Unauthorized), удаляем токен и перенаправляем на логин
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Если мы используем react-router, то можем использовать его для перенаправления
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 