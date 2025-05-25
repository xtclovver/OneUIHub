import { apiClient } from './client';
import { ApiResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ data: ApiResponse<{ user: User; token: string }> }> => {
    const response = await apiClient.post('/auth/login', credentials);
    return {
      data: {
        data: response.data as { user: User; token: string },
        success: true,
        message: 'Успешный вход'
      }
    };
  },

  register: async (credentials: RegisterCredentials): Promise<{ data: ApiResponse<{ user: User; token: string }> }> => {
    const response = await apiClient.post('/auth/register', credentials);
    return {
      data: {
        data: response.data as { user: User; token: string },
        success: true,
        message: 'Успешная регистрация'
      }
    };
  },

  getProfile: async (): Promise<{ data: ApiResponse<User> }> => {
    const response = await apiClient.get('/me');
    return {
      data: {
        data: (response.data as any).user,
        success: true,
        message: 'Профиль получен'
      }
    };
  },

  logout: async (): Promise<{ data: ApiResponse<null> }> => {
    // Просто очищаем токен на клиенте
    localStorage.removeItem('token');
    return {
      data: {
        data: null,
        success: true,
        message: 'Успешный выход'
      }
    };
  },
}; 