import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Model {
  id: string;
  company_id: string;
  name: string;
  description: string;
  external_id: string;
  company?: {
    name: string;
    logo_url: string;
  };
}

interface ModelRequestProps {
  selectedModelId?: string;
}

const ModelRequest: React.FC<ModelRequestProps> = ({ selectedModelId }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(selectedModelId || '');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<{ input: number; output: number }>({ input: 0, output: 0 });
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // Загрузка списка моделей
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const response = await axios.get(`${API_URL}/models`);
        const modelsWithCompanies = await Promise.all(
          response.data.map(async (model: Model) => {
            try {
              const companyResponse = await axios.get(`${API_URL}/companies/${model.company_id}`);
              return {
                ...model,
                company: companyResponse.data,
              };
            } catch (err) {
              return model;
            }
          })
        );
        setModels(modelsWithCompanies);
        
        // Если модель уже выбрана или передана через props
        if (selectedModelId && !selectedModel) {
          setSelectedModel(selectedModelId);
        } else if (modelsWithCompanies.length > 0 && !selectedModel) {
          // По умолчанию выбираем первую модель
          setSelectedModel(modelsWithCompanies[0].id);
        }
        
        setModelsLoading(false);
      } catch (err) {
        setError('Не удалось загрузить список моделей');
        setModelsLoading(false);
        console.error(err);
      }
    };

    fetchModels();
  }, [API_URL, selectedModelId, selectedModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Пожалуйста, введите запрос');
      return;
    }
    
    if (!selectedModel) {
      setError('Пожалуйста, выберите модель');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResponse('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { redirectTo: window.location.pathname } });
        return;
      }
      
      const requestData = {
        model_id: selectedModel,
        content: prompt
      };
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const result = await axios.post(`${API_URL}/llm/completions`, requestData, config);
      
      setResponse(result.data.content);
      setTokens({
        input: result.data.input_tokens || 0,
        output: result.data.output_tokens || 0
      });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { redirectTo: window.location.pathname } });
        return;
      }
      
      if (err.response && err.response.status === 429) {
        setError('Превышен лимит запросов. Попробуйте позже или перейдите на более высокий тариф.');
        return;
      }
      
      setError(err.response?.data?.message || 'Произошла ошибка при обработке запроса');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Отправить запрос к модели</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Выбор модели */}
            <div className="mb-6">
              <label htmlFor="model-select" className="block mb-2 text-sm font-medium text-gray-700">
                Выберите модель:
              </label>
              {modelsLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              ) : (
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Выберите модель</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.company?.name ? `${model.company.name} - ` : ''}{model.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Текстовое поле для запроса */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-700">
                Ваш запрос:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите текст запроса..."
                disabled={loading}
              ></textarea>
            </div>
            
            {/* Сообщение об ошибке */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {/* Кнопка отправки */}
            <div className="mb-6">
              <button
                type="submit"
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading || !selectedModel}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Обработка...
                  </span>
                ) : (
                  'Отправить запрос'
                )}
              </button>
            </div>
          </form>
          
          {/* Результат обработки запроса */}
          {response && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Ответ:</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 whitespace-pre-wrap">
                {response}
              </div>
              
              {/* Статистика по токенам */}
              <div className="mt-4 text-sm text-gray-600">
                <p>Количество входящих токенов: {tokens.input}</p>
                <p>Количество исходящих токенов: {tokens.output}</p>
                <p>Всего использовано токенов: {tokens.input + tokens.output}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelRequest; 