import axios from 'axios';
import { store } from '../redux/store';

// Создаем экземпляр axios с базовым URL
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена авторизации к запросам
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если ошибка 401 (Неавторизован), можно выполнить выход пользователя
    if (error.response && error.response.status === 401) {
      // store.dispatch({ type: 'auth/logout' });
    }
    
    return Promise.reject(error);
  }
);

export default api; 