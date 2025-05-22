import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/slices/authSlice';

// Базовый URL для API запросов
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Временные мок-данные для разработки
const mockCompanies = [
  { 
    id: '1', 
    name: 'Anthropic', 
    logoURL: '/src/svg/anthropic-logo.svg', 
    description: 'Создатели Claude - современного ИИ-ассистента с акцентом на безопасность и надежность.' 
  },
  { 
    id: '2', 
    name: 'OpenAI', 
    logoURL: '/src/svg/openai-logo.svg', 
    description: 'Разработчики GPT-4, DALL-E 3 и других передовых ИИ-моделей.' 
  },
  { 
    id: '3', 
    name: 'Google', 
    logoURL: '/src/svg/google-logo.svg', 
    description: 'Семейство моделей Gemini для различных задач ИИ.' 
  },
  { 
    id: '4', 
    name: 'Microsoft', 
    logoURL: '/src/svg/microsoft-logo.svg', 
    description: 'Платформа Azure OpenAI и другие ИИ-решения для бизнеса.' 
  },
  { 
    id: '5', 
    name: 'Meta', 
    logoURL: '/src/svg/meta-logo.svg', 
    description: 'Создатели семейства моделей Llama с открытым исходным кодом.' 
  },
  { 
    id: '6', 
    name: 'DeepSeek', 
    logoURL: '/src/svg/deepseek-logo.svg', 
    description: 'Инновационные модели для кодирования и генерации контента.' 
  }
];

// Создаем экземпляр axios с базовым URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена авторизации к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
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
    // Если ошибка 401 (Неавторизован), выполняем выход пользователя
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    
    return Promise.reject(error);
  }
);

// Временный мок API для разработки
export const mockApi = {
  getCompanies: () => {
    return Promise.resolve({ data: mockCompanies });
  },
  
  getCompanyById: (id: string) => {
    const company = mockCompanies.find(c => c.id === id);
    if (company) {
      return Promise.resolve({ data: company });
    }
    return Promise.reject({ response: { status: 404, data: { message: 'Компания не найдена' } } });
  }
};

export default api; 