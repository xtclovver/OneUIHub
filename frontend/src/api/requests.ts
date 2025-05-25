import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Request, RequestFilters } from '../types';

// Мок данные для запросов
const mockRequests: Request[] = [
  {
    id: '1',
    user_id: '1',
    model_id: '1',
    input_tokens: 150,
    output_tokens: 300,
    input_cost: 0.00045,
    output_cost: 0.0045,
    total_cost: 0.00495,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    user_id: '1',
    model_id: '3',
    input_tokens: 200,
    output_tokens: 400,
    input_cost: 0.001,
    output_cost: 0.006,
    total_cost: 0.007,
    created_at: '2024-01-14T14:20:00Z',
  }
];

export const requestsAPI = {
  getAll: (params: { page?: number; limit?: number } & RequestFilters): Promise<{ data: ApiResponse<PaginatedResponse<Request>> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 20 } = params;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = mockRequests.slice(start, end);
        
        resolve({
          data: {
            data: {
              data: paginatedData,
              total: mockRequests.length,
              page,
              limit,
              has_next: end < mockRequests.length,
              has_prev: page > 1,
            },
            success: true,
            message: 'Запросы загружены'
          }
        });
      }, 800);
    });
  },

  getById: (id: string): Promise<{ data: ApiResponse<Request> }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequests.find(r => r.id === id);
        if (request) {
          resolve({
            data: {
              data: request,
              success: true,
              message: 'Запрос найден'
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Запрос не найден'
              }
            }
          });
        }
      }, 500);
    });
  },
}; 