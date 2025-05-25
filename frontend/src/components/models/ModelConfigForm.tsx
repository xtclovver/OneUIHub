import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ModelConfig {
  id?: string;
  model_id: string;
  is_free: boolean;
  is_enabled: boolean;
  input_token_cost: number;
  output_token_cost: number;
}

interface ModelConfigFormProps {
  modelId: string;
  onSave: (config: ModelConfig) => void;
  existingConfig?: ModelConfig;
}

const ModelConfigForm: React.FC<ModelConfigFormProps> = ({ modelId, onSave, existingConfig }) => {
  const [config, setConfig] = useState<ModelConfig>({
    model_id: modelId,
    is_free: false,
    is_enabled: true,
    input_token_cost: 0,
    output_token_cost: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    // Если есть существующая конфигурация, используем её
    if (existingConfig) {
      setConfig(existingConfig);
    }
    
    // Проверяем роль пользователя
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        }
      } catch (err) {
        console.error('Ошибка при получении информации о пользователе', err);
      }
    };
    
    fetchUserRole();
  }, [existingConfig, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole !== 'admin' && userRole !== 'support') {
      setError('У вас нет прав для изменения конфигурации модели');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      onSave(config);
      setLoading(false);
    } catch (err) {
      setError('Произошла ошибка при сохранении конфигурации');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Конфигурация модели</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                name="is_free"
                checked={config.is_free}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={userRole !== 'admin' && userRole !== 'support'}
              />
              Доступна бесплатно
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                name="is_enabled"
                checked={config.is_enabled}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={userRole !== 'admin' && userRole !== 'support'}
              />
              Включена
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость входящих токенов (за 1K токенов)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="input_token_cost"
                value={config.input_token_cost}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.000001"
                min="0"
                disabled={userRole !== 'admin' && userRole !== 'support'}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость исходящих токенов (за 1K токенов)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="output_token_cost"
                value={config.output_token_cost}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.000001"
                min="0"
                disabled={userRole !== 'admin' && userRole !== 'support'}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
              loading || (userRole !== 'admin' && userRole !== 'support') ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading || (userRole !== 'admin' && userRole !== 'support')}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
      
      {(userRole !== 'admin' && userRole !== 'support') && (
        <div className="mt-4 text-sm text-gray-500">
          Только администраторы и поддержка могут изменять конфигурацию модели.
        </div>
      )}
    </div>
  );
};

export default ModelConfigForm; 