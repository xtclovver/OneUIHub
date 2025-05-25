import { apiClient } from './client';
import { ApiResponse, Model, ModelFilters, RateLimit, Tier } from '../types';
import { mockModels, mockTiers } from './mockData';

export const modelsAPI = {
  getAll: (filters?: ModelFilters): Promise<{ data: ApiResponse<Model[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredModels = [...mockModels];
        
        if (filters?.company_id) {
          filteredModels = filteredModels.filter(m => m.company_id === filters.company_id);
        }
        
        if (filters?.is_free !== undefined) {
          filteredModels = filteredModels.filter(m => m.config?.is_free === filters.is_free);
        }
        
        if (filters?.is_enabled !== undefined) {
          filteredModels = filteredModels.filter(m => m.config?.is_enabled === filters.is_enabled);
        }
        
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredModels = filteredModels.filter(m => 
            m.name.toLowerCase().includes(searchTerm) ||
            m.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        resolve({
          data: {
            data: filteredModels,
            success: true,
            message: 'Модели успешно загружены'
          }
        });
      }, 1200);
    });
  },

  getById: (id: string): Promise<{ data: ApiResponse<Model> }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const model = mockModels.find(m => m.id === id);
        if (model) {
          resolve({
            data: {
              data: model,
              success: true,
              message: 'Модель найдена'
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Модель не найдена'
              }
            }
          });
        }
      }, 500);
    });
  },

  getByCompany: (companyId: string): Promise<{ data: ApiResponse<Model[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const models = mockModels.filter(m => m.company_id === companyId);
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

  getRateLimits: (): Promise<{ data: ApiResponse<RateLimit[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: [],
            success: true,
            message: 'Лимиты загружены'
          }
        });
      }, 500);
    });
  },

  getTiers: (): Promise<{ data: ApiResponse<Tier[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockTiers,
            success: true,
            message: 'Тарифы загружены'
          }
        });
      }, 500);
    });
  },
}; 