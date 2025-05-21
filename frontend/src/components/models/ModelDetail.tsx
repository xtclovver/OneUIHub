import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Model {
  id: string;
  company_id: string;
  name: string;
  description: string;
  features: string;
  external_id: string;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  external_id: string;
}

interface ModelConfig {
  id: string;
  model_id: string;
  is_free: boolean;
  is_enabled: boolean;
  input_token_cost: number;
  output_token_cost: number;
}

interface RateLimit {
  id: string;
  model_id: string;
  tier_id: string;
  requests_per_minute: number;
  requests_per_day: number;
  tokens_per_minute: number;
  tokens_per_day: number;
}

interface Tier {
  id: string;
  name: string;
  is_free: boolean;
  price: number;
  description: string;
}

const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<Model | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [tiers, setTiers] = useState<Record<string, Tier>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загрузка информации о модели
        const modelResponse = await axios.get(`${API_URL}/models/${id}`);
        setModel(modelResponse.data);

        // Загрузка информации о компании
        const companyResponse = await axios.get(`${API_URL}/companies/${modelResponse.data.company_id}`);
        setCompany(companyResponse.data);

        // Загрузка конфигурации модели (если пользователь авторизован как админ)
        try {
          const modelConfigResponse = await axios.get(`${API_URL}/admin/model-configs/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setModelConfig(modelConfigResponse.data);
        } catch (configError) {
          console.log('Нет доступа к конфигурации модели или конфигурация не существует');
        }

        // Загрузка ограничений для модели
        const rateLimitsResponse = await axios.get(`${API_URL}/rate-limits?model_id=${id}`);
        setRateLimits(rateLimitsResponse.data);

        // Загрузка информации о тирах
        const tiersResponse = await axios.get(`${API_URL}/tiers`);
        const tiersMap: Record<string, Tier> = {};
        tiersResponse.data.forEach((tier: Tier) => {
          tiersMap[tier.id] = tier;
        });
        setTiers(tiersMap);

        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о модели');
        setLoading(false);
        console.error('Ошибка при загрузке данных:', err);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error || 'Модель не найдена'}</p>
        <Link to="/models" className="text-blue-500 hover:underline mt-2 inline-block">
          Вернуться к списку моделей
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/models" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад к списку моделей
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            {company?.logo_url && (
              <img src={company.logo_url} alt={company.name} className="w-16 h-16 object-contain mr-4" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{model.name}</h1>
              {company && <p className="text-gray-600">{company.name}</p>}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-gray-700 mb-6">{model.description || 'Описание отсутствует'}</p>

            {model.features && (
              <>
                <h2 className="text-xl font-semibold mb-2">Особенности</h2>
                <p className="text-gray-700 mb-6">{model.features}</p>
              </>
            )}

            {modelConfig && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Конфигурация модели</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Доступна бесплатно:</p>
                      <p className="font-medium">{modelConfig.is_free ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Включена:</p>
                      <p className="font-medium">{modelConfig.is_enabled ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Стоимость входящих токенов:</p>
                      <p className="font-medium">${modelConfig.input_token_cost} / 1K токенов</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Стоимость исходящих токенов:</p>
                      <p className="font-medium">${modelConfig.output_token_cost} / 1K токенов</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rateLimits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Ограничения по тарифам</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Тариф
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Запросов в минуту
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Запросов в день
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Токенов в минуту
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Токенов в день
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rateLimits.map((limit) => (
                        <tr key={limit.id}>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {tiers[limit.tier_id]?.name || 'Неизвестный тариф'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{limit.requests_per_minute}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{limit.requests_per_day}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{limit.tokens_per_minute}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{limit.tokens_per_day}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/dashboard/new-request"
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md font-medium transition-colors"
        >
          Использовать модель
        </Link>
      </div>
    </div>
  );
};

export default ModelDetail; 