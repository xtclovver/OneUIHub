import React, { useState, useEffect } from 'react';
import { User, CreditCard, Activity, Settings, Key, DollarSign } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  fetchUserUsage, 
  fetchUserApiKeys, 
  fetchUserBudget, 
  fetchUsageStats, 
  fetchRequestHistory,
  createApiKey,
  deactivateApiKey
} from '../../redux/slices/litellmSlice';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  tier: {
    name: string;
    description: string;
    monthly_limit: number;
    price: number;
  };
  spending: {
    current_month: number;
    total: number;
    currency: string;
  };
  api_keys: Array<{
    id: string;
    name: string;
    created_at: string;
    last_used: string;
    is_active: boolean;
  }>;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useSelector((state: RootState) => state.auth);
  const { usage, apiKeys, budget, usageStats, requestHistory, isLoading } = useSelector((state: RootState) => state.litellm);

  useEffect(() => {
    if (user?.id) {
      // Загружаем данные пользователя из LiteLLM
      dispatch(fetchUserUsage(user.id) as any);
      dispatch(fetchUserApiKeys(user.id) as any);
      dispatch(fetchUserBudget(user.id) as any);
      dispatch(fetchUsageStats({ userId: user.id, period: 'month' }) as any);
      dispatch(fetchRequestHistory({ userId: user.id, limit: 50 }) as any);
    }
  }, [user?.id, dispatch]);

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: User },
    { id: 'requests', label: 'Запросы', icon: Activity },
    { id: 'billing', label: 'Биллинг', icon: CreditCard },
    { id: 'usage', label: 'Использование', icon: Activity },
    { id: 'api-keys', label: 'API ключи', icon: Key },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600">Не удалось загрузить данные профиля</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
          <p className="mt-2 text-gray-600">Управляйте своим аккаунтом и настройками</p>
        </div>

        {/* Навигация по вкладкам */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Содержимое вкладок */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Информация о пользователе */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о пользователе</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID пользователя</label>
                      <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Роль</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Дата регистрации</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Статистика */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Тарифный план</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {budget ? `Лимит: $${budget.monthly_limit}` : 'Загрузка...'}
                    </p>
                    <p className="text-sm text-gray-600">ID тарифа: {user.tier_id}</p>
                    <p className="text-sm text-gray-900">
                      Валюта: {budget?.currency || 'USD'}
                    </p>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Расходы LiteLLM</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Текущий месяц:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${usage?.current_month_usage?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Всего:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${usage?.total_usage?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {budget && usage && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Использовано:</span>
                          <span>{((usage.current_month_usage / budget.monthly_limit) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((usage.current_month_usage / budget.monthly_limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">История запросов</h3>
                <div className="flex space-x-2">
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">Все модели</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="7">Последние 7 дней</option>
                    <option value="30">Последние 30 дней</option>
                    <option value="90">Последние 90 дней</option>
                  </select>
                </div>
              </div>
              
              {/* Статистика запросов */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1,234</div>
                  <div className="text-sm text-blue-600">Всего запросов</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,180</div>
                  <div className="text-sm text-green-600">Успешных</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">54</div>
                  <div className="text-sm text-red-600">Ошибок</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">156ms</div>
                  <div className="text-sm text-yellow-600">Среднее время</div>
                </div>
              </div>

              {/* Таблица запросов */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Модель
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Токены
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Стоимость
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Моковые данные для демонстрации */}
                    {[
                      { time: '14:32', model: 'GPT-4', tokens: '1,250', cost: '$0.025', status: 'success' },
                      { time: '14:28', model: 'Claude 3', tokens: '890', cost: '$0.018', status: 'success' },
                      { time: '14:15', model: 'GPT-3.5', tokens: '2,100', cost: '$0.004', status: 'error' },
                      { time: '13:45', model: 'GPT-4', tokens: '750', cost: '$0.015', status: 'success' },
                    ].map((request, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.tokens}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.cost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'success' ? 'Успешно' : 'Ошибка'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Биллинг и платежи</h3>
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Раздел в разработке</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет информация о платежах и счетах
                </p>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Использование API</h3>
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Раздел в разработке</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет статистика использования API
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">API ключи</h3>
                <button 
                  onClick={() => {
                    if (user?.id) {
                      const name = prompt('Введите название ключа:');
                      if (name) {
                        dispatch(createApiKey({ userId: user.id, name }) as any);
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Создать ключ
                </button>
              </div>
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Нет API ключей</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Создайте первый API ключ для начала работы
                    </p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{key.name}</h4>
                          <p className="text-sm text-gray-500">
                            Создан: {new Date(key.created_at).toLocaleDateString('ru-RU')}
                          </p>
                          {key.last_used && (
                            <p className="text-sm text-gray-500">
                              Последнее использование: {new Date(key.last_used).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            key.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {key.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                          <button 
                            onClick={() => {
                              if (window.confirm('Вы уверены, что хотите удалить этот ключ?')) {
                                dispatch(deactivateApiKey(key.id) as any);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки аккаунта</h3>
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Раздел в разработке</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будут настройки аккаунта
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 