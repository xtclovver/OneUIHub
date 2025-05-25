import { apiClient } from './client';
import { ApiResponse, Model, ModelFilters, RateLimit, Tier } from '../types';

export const modelsAPI = {
  getAll: (filters?: ModelFilters): Promise<{ data: ApiResponse<Model[]> }> => {
    const params = new URLSearchParams();
    
    if (filters?.company_id) {
      params.append('company_id', filters.company_id);
    }
    if (filters?.is_free !== undefined) {
      params.append('is_free', filters.is_free.toString());
    }
    if (filters?.is_enabled !== undefined) {
      params.append('is_enabled', filters.is_enabled.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = queryString ? `/models?${queryString}` : '/models';
    
    return apiClient.get<ApiResponse<Model[]>>(url);
  },

  getById: (id: string): Promise<{ data: ApiResponse<Model> }> => {
    return apiClient.get<ApiResponse<Model>>(`/models/${id}`);
  },

  getByCompany: (companyId: string): Promise<{ data: ApiResponse<Model[]> }> => {
    return apiClient.get<ApiResponse<Model[]>>(`/companies/${companyId}/models`);
  },

  getRateLimits: (): Promise<{ data: ApiResponse<RateLimit[]> }> => {
    // TODO: Добавить эндпоинт для лимитов в бэкенд
    return Promise.resolve({
      data: {
        data: [],
        success: true,
        message: 'Лимиты загружены'
      }
    });
  },

  getTiers: (): Promise<{ data: ApiResponse<Tier[]> }> => {
    return apiClient.get<ApiResponse<Tier[]>>('/tiers');
  },
}; 