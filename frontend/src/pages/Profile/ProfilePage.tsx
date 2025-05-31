import React, { useState, useEffect } from 'react';
import { User, CreditCard, Activity, Settings, Key, DollarSign, Copy, Check, X, Clock, Zap, Eye } from 'lucide-react';
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
  clearNewApiKey,
  clearRequestHistory
} from '../../redux/slices/litellmSlice';
import { LiteLLMRequest } from '../../api/litellm';

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
  const [activeRequestTab, setActiveRequestTab] = useState('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LiteLLMRequest | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { usage, apiKeys, budget, usageStats, requestHistory, isLoading, newApiKey, requestHistoryMeta } = useSelector((state: RootState) => state.litellm);

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

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = (end - start) / 1000;
    return duration.toFixed(2);
  };

  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">История запросов</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {requestHistory.length > 0 && requestHistoryMeta && (
                      `Показано ${requestHistory.length} из ${requestHistoryMeta.total_count}`
                    )}
                  </span>
                  <button
                    onClick={() => {
                      if (user?.id) {
                        dispatch(clearRequestHistory());
                        dispatch(fetchRequestHistory({ userId: user.id, limit: 50, offset: 0 }) as any);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Обновить
                  </button>
                </div>
              </div>

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
                    <div key={request.request_id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {request.model || request.model_group}
                            </h4>
                            {request.custom_llm_provider && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                                {request.custom_llm_provider}
                              </span>
                            )}
                            {request.status && (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                                request.status === 'success' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {new Date(request.start_time).toLocaleString('ru-RU')}
                            </span>
                            {request.api_key_name && (
                              <span>API ключ: {request.api_key_name}</span>
                            )}
                            {request.session_id && (
                              <span>Сессия: {request.session_id.substring(0, 8)}...</span>
                            )}
                          </div>
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Входящие токены:</span>
                          <span className="ml-1 font-medium">{request.input_tokens || request.prompt_tokens || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Исходящие токены:</span>
                          <span className="ml-1 font-medium">{request.output_tokens || request.completion_tokens || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Тип вызова:</span>
                          <span className="ml-1 font-medium">{request.call_type || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Кэш:</span>
                          <span className={`ml-1 font-medium ${
                            request.cache_hit === 'True' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {request.cache_hit === 'True' ? 'Попадание' : 'Промах'}
                          </span>
                        </div>
                      </div>

                      {request.request_tags && request.request_tags.length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Теги: </span>
                          {request.request_tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md mr-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>ID: {request.request_id.substring(0, 8)}...</span>
                          {request.end_time && request.start_time && (
                            <span>
                              Время выполнения: {
                                Math.round((new Date(request.end_time).getTime() - new Date(request.start_time).getTime()) / 1000 * 100) / 100
                              }с
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.metadata && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setActiveRequestTab('overview');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-3 w-3 inline mr-1" />
                              Детали
                            </button>
                          )}
                          {(request.messages || request.response) && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setActiveRequestTab('overview');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-3 w-3 inline mr-1" />
                              Просмотр
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Пагинация */}
                  {requestHistoryMeta && requestHistoryMeta.has_more && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => {
                          if (user?.id && requestHistoryMeta) {
                            const nextOffset = requestHistoryMeta.offset + requestHistoryMeta.limit;
                            dispatch(fetchRequestHistory({ 
                              userId: user.id, 
                              limit: 50, 
                              offset: nextOffset,
                              append: true 
                            }) as any);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Загрузка...' : 'Загрузить ещё'}
                      </button>
                    </div>
                  )}
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
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
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

                      {/* Статистика использования */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Запросов:</span>
                          <span className="ml-1 font-medium">{key.usage_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Потрачено:</span>
                          <span className="ml-1 font-medium">${(key.total_cost || 0).toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Моделей:</span>
                          <span className="ml-1 font-medium">
                            {key.models_used ? Object.keys(key.models_used).length : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Провайдеров:</span>
                          <span className="ml-1 font-medium">
                            {key.providers_used ? Object.keys(key.providers_used).length : 0}
                          </span>
                        </div>
                      </div>

                      {/* Детали использованных моделей */}
                      {key.models_used && Object.keys(key.models_used).length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Модели: </span>
                          {Object.entries(key.models_used).slice(0, 3).map(([model, count]) => (
                            <span
                              key={model}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md mr-1"
                            >
                              {model} ({count})
                            </span>
                          ))}
                          {Object.keys(key.models_used).length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{Object.keys(key.models_used).length - 3} ещё
                            </span>
                          )}
                        </div>
                      )}

                      {/* Детали использованных провайдеров */}
                      {key.providers_used && Object.keys(key.providers_used).length > 0 && (
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Провайдеры: </span>
                          {Object.entries(key.providers_used).map(([provider, count]) => (
                            <span
                              key={provider}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md mr-1"
                            >
                              {provider} ({count})
                            </span>
                          ))}
                        </div>
                      )}
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

      {/* Модальное окно для показа деталей запроса */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Детали запроса - {selectedRequest.model}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {['overview', 'metadata', 'messages', 'response'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveRequestTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeRequestTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'overview' && 'Обзор'}
                    {tab === 'metadata' && 'Метаданные'}
                    {tab === 'messages' && 'Сообщения'}
                    {tab === 'response' && 'Ответ'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Обзор */}
              {activeRequestTab === 'overview' && (
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <label className="block text-gray-600 font-medium">ID запроса:</label>
                    <p className="mt-1">{selectedRequest.request_id}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Модель:</label>
                    <p className="mt-1">{selectedRequest.model}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Провайдер:</label>
                    <p className="mt-1">{selectedRequest.custom_llm_provider || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Стоимость:</label>
                    <p className="mt-1">${selectedRequest.cost.toFixed(6)}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Время начала:</label>
                    <p className="mt-1">{new Date(selectedRequest.start_time).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Время окончания:</label>
                    <p className="mt-1">{new Date(selectedRequest.end_time).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Длительность:</label>
                    <p className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(selectedRequest.start_time, selectedRequest.end_time)}с
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Токены:</label>
                    <p className="mt-1">
                      {selectedRequest.total_tokens} (вх: {selectedRequest.input_tokens}, исх: {selectedRequest.output_tokens})
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Статус:</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        selectedRequest.status === 'success' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium">Кэш:</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        selectedRequest.cache_hit === 'True' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRequest.cache_hit === 'True' ? 'Попадание' : 'Промах'}
                      </span>
                    </p>
                  </div>
                  {selectedRequest.api_key_name && (
                    <div>
                      <label className="block text-gray-600 font-medium">API ключ:</label>
                      <p className="mt-1">{selectedRequest.api_key_name}</p>
                    </div>
                  )}
                  {selectedRequest.session_id && (
                    <div>
                      <label className="block text-gray-600 font-medium">Сессия:</label>
                      <p className="mt-1">{selectedRequest.session_id}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Метаданные */}
              {activeRequestTab === 'metadata' && selectedRequest.metadata && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Метаданные</h4>
                  <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                    {formatJSON(selectedRequest.metadata)}
                  </pre>
                </div>
              )}

              {/* Сообщения */}
              {activeRequestTab === 'messages' && selectedRequest.messages && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Сообщения</h4>
                  <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                    {formatJSON(selectedRequest.messages)}
                  </pre>
                </div>
              )}

              {/* Ответ */}
              {activeRequestTab === 'response' && selectedRequest.response && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Ответ</h4>
                  <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
                    {formatJSON(selectedRequest.response)}
                  </pre>
                </div>
              )}

              {/* Показываем сообщение если нет данных для выбранного таба */}
              {activeRequestTab === 'metadata' && !selectedRequest.metadata && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Метаданные недоступны для этого запроса</p>
                </div>
              )}
              {activeRequestTab === 'messages' && !selectedRequest.messages && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Сообщения недоступны для этого запроса</p>
                </div>
              )}
              {activeRequestTab === 'response' && !selectedRequest.response && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ответ недоступен для этого запроса</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(formatJSON(selectedRequest));
                  alert('Данные скопированы в буфер обмена');
                }}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600"
              >
                <Copy className="h-4 w-4 inline mr-1" />
                Копировать
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 