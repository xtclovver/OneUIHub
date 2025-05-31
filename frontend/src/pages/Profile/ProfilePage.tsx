import React, { useState, useEffect } from 'react';
import { User, CreditCard, Activity, Settings, Key, DollarSign, Copy, Check } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  fetchUserUsage, 
  fetchUserApiKeys, 
  fetchUserBudget, 
  fetchUsageStats, 
  fetchRequestHistory,
  createApiKey,
  deactivateApiKey,
  clearNewApiKey
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { usage, apiKeys, budget, usageStats, requestHistory, isLoading, newApiKey } = useSelector((state: RootState) => state.litellm);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCreateApiKey = () => {
    if (user?.id) {
      const name = prompt('Введите название ключа:');
      if (name) {
        dispatch(createApiKey({ userId: user.id, name }) as any);
      }
    }
  };

  const handleCloseNewKeyDialog = () => {
    dispatch(clearNewApiKey());
  };

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
              <h3 className="text-lg font-medium text-gray-900 mb-4">История запросов</h3>
              {requestHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет истории запросов</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ваши запросы к AI моделям будут отображаться здесь
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requestHistory.map((request, index) => (
                    <div key={request.id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.model || request.model_group}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${request.cost?.toFixed(6) || '0.000000'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.total_tokens || 0} токенов
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Входящие токены:</span>
                          <span className="ml-1 font-medium">{request.input_tokens || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Исходящие токены:</span>
                          <span className="ml-1 font-medium">{request.output_tokens || 0}</span>
                        </div>
                        {request.status_code && (
                          <div>
                            <span className="text-gray-500">Статус:</span>
                            <span className={`ml-1 font-medium ${
                              request.status_code === 200 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {request.status_code}
                            </span>
                          </div>
                        )}
                        {request.request_tags && request.request_tags.length > 0 && (
                          <div>
                            <span className="text-gray-500">Теги:</span>
                            <span className="ml-1">{request.request_tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  onClick={handleCreateApiKey}
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

      {/* Модальное окно для показа нового API ключа */}
      {newApiKey && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                API ключ создан!
              </h3>
              <div className="mt-4 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  Сохраните этот ключ в безопасном месте. Он больше не будет показан.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={newApiKey.api_key || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(newApiKey.api_key || '')}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {copiedKey === newApiKey.api_key ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-4 text-left">
                  <p className="text-sm text-gray-600">
                    <strong>Название:</strong> {newApiKey.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Создан:</strong> {new Date(newApiKey.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleCloseNewKeyDialog}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 