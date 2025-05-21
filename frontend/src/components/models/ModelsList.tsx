import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Model {
  id: string;
  company_id: string;
  name: string;
  description: string;
  features: string;
  external_id: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

interface Company {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  external_id: string;
}

const ModelsList: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загрузка списка моделей
        const modelsResponse = await axios.get(`${API_URL}/models`);
        
        // Загрузка списка компаний
        const companiesResponse = await axios.get(`${API_URL}/companies`);
        
        // Создаем словарь компаний для быстрого доступа
        const companiesMap: Record<string, Company> = {};
        companiesResponse.data.forEach((company: Company) => {
          companiesMap[company.id] = company;
        });
        
        // Добавляем информацию о компании к каждой модели
        const modelsWithCompanies = modelsResponse.data.map((model: Model) => {
          return {
            ...model,
            company: companiesMap[model.company_id],
          };
        });
        
        setModels(modelsWithCompanies);
        setCompanies(companiesMap);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        setLoading(false);
        console.error('Ошибка при загрузке данных:', err);
      }
    };

    fetchData();
  }, [API_URL]);

  // Фильтрация моделей по выбранной компании
  const filteredModels = selectedCompany === 'all'
    ? models
    : models.filter(model => model.company_id === selectedCompany);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Модели искусственного интеллекта</h1>
      
      {/* Фильтр по компаниям */}
      <div className="mb-6">
        <label htmlFor="company-filter" className="block mb-2 text-sm font-medium">
          Фильтр по компаниям:
        </label>
        <select
          id="company-filter"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64"
        >
          <option value="all">Все компании</option>
          {Object.values(companies).map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Список моделей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center p-4 border-b">
                {model.company?.logo_url ? (
                  <img
                    src={model.company.logo_url}
                    alt={model.company?.name || 'Логотип компании'}
                    className="w-10 h-10 object-contain mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-500 text-xs">Лого</span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{model.name}</h2>
                  <p className="text-sm text-gray-600">{model.company?.name || 'Компания не указана'}</p>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 mb-4 line-clamp-3">{model.description || 'Описание отсутствует'}</p>
                
                {model.features && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Особенности:</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{model.features}</p>
                  </div>
                )}
                
                <Link
                  to={`/models/${model.id}`}
                  className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Нет доступных моделей</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelsList; 