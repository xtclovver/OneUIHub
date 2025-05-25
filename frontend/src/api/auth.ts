import { apiClient } from './client';
import { ApiResponse, LoginCredentials, RegisterCredentials, User } from '../types';

// Мок пользователь
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  tier_id: '2',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const authAPI = {
  login: (credentials: LoginCredentials): Promise<{ data: ApiResponse<{ user: User; token: string }> }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          resolve({
            data: {
              data: {
                user: mockUser,
                token: 'mock-jwt-token-12345'
              },
              success: true,
              message: 'Успешный вход'
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Неверные учетные данные'
              }
            }
          });
        }
      }, 1000);
    });
  },

  register: (credentials: RegisterCredentials): Promise<{ data: ApiResponse<{ user: User; token: string }> }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          resolve({
            data: {
              data: {
                user: mockUser,
                token: 'mock-jwt-token-12345'
              },
              success: true,
              message: 'Успешная регистрация'
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Некорректные данные'
              }
            }
          });
        }
      }, 1000);
    });
  },

  getProfile: (): Promise<{ data: ApiResponse<User> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockUser,
            success: true,
            message: 'Профиль получен'
          }
        });
      }, 500);
    });
  },

  logout: (): Promise<{ data: ApiResponse<null> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: null,
            success: true,
            message: 'Успешный выход'
          }
        });
      }, 500);
    });
  },
}; 