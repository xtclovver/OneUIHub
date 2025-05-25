import { apiClient } from './client';
import { ApiResponse, Company, Model } from '../types';
import { mockCompanies, mockModels } from './mockData';

export const companiesAPI = {
  getAll: (): Promise<{ data: ApiResponse<Company[]> }> => {
    // Имитируем API запрос с задержкой
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockCompanies,
            success: true,
            message: 'Компании успешно загружены'
          }
        });
      }, 1000);
    });
  },

  getById: (id: string): Promise<{ data: ApiResponse<Company> }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const company = mockCompanies.find(c => c.id === id);
        if (company) {
          resolve({
            data: {
              data: company,
              success: true,
              message: 'Компания найдена'
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Компания не найдена'
              }
            }
          });
        }
      }, 500);
    });
  },

  getModels: (id: string): Promise<{ data: ApiResponse<Model[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const models = mockModels.filter(m => m.company_id === id);
        resolve({
          data: {
            data: models,
            success: true,
            message: 'Модели компании загружены'
          }
        });
      }, 800);
    });
  },
}; 