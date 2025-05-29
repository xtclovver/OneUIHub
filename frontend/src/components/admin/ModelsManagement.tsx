import React, { useState, useEffect, useCallback } from 'react';
import {
  CpuChipIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  getModelGroupInfo,
  getAllModels,
  createModel,
  updateModel,
  deleteModel,
  formatCurrency,
  formatNumber,
  syncModelsFromLiteLLM,
  syncModelsFromModelGroup,
  syncCompaniesFromLiteLLM,
  adminAPI,
} from '../../api/admin';
import { ModelGroupInfo, CreateModelRequest, UpdateModelRequest } from '../../types/admin';
import { RateLimit, Tier } from '../../types';

// Добавляем интерфейс для модели из БД
interface DBModel {
  id: string;
  company_id: string;
  name: string;
  description: string;
  features: string;
  external_id: string;
  providers: string;
  max_input_tokens: number | null;
  max_output_tokens: number | null;
  mode: string;
  supports_parallel_function_calling: boolean;
  supports_vision: boolean;
  supports_web_search: boolean;
  supports_reasoning: boolean;
  supports_function_calling: boolean;
  supported_openai_params: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    logo_url?: string;
    description?: string;
    external_id?: string;
  };
  model_config?: {
    id: string;
    model_id: string;
    input_token_cost: number;
    output_token_cost: number;
    is_free: boolean;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface ModelsManagementProps {
  onClose?: () => void;
}

const ModelsManagement: React.FC<ModelsManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'models'>('groups');
  const [modelGroups, setModelGroups] = useState<ModelGroupInfo[]>([]);
  const [models, setModels] = useState<DBModel[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<DBModel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [];
      
      if (activeTab === 'groups') {
        promises.push(getModelGroupInfo().then(response => setModelGroups(response.data)));
      } else {
        promises.push(getAllModels().then(response => setModels(response.data)));
      }
      
      // Всегда загружаем rate limits и tiers для редактора моделей
      promises.push(adminAPI.getRateLimits().then(response => setRateLimits(response.data.data)));
      promises.push(adminAPI.getTiers().then(response => setTiers(response.data.data)));
      
      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleCreateModel = async (data: CreateModelRequest) => {
    try {
      await createModel(data);
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании модели');
    }
  };

  const handleUpdateModel = async (data: UpdateModelRequest) => {
    try {
      await updateModel(data);
      setShowEditModal(false);
      setSelectedModel(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении модели');
    }
  };

  const handleDeleteModel = async () => {
    if (!modelToDelete) return;
    
    try {
      await deleteModel(modelToDelete);
      setShowDeleteModal(false);
      setModelToDelete(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении модели');
    }
  };

  const openDeleteModal = (modelId: string) => {
    setModelToDelete(modelId);
    setShowDeleteModal(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncModelsFromLiteLLM();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при синхронизации моделей');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFromModelGroup = async () => {
    setSyncing(true);
    setError(null);
    try {
      // Сначала синхронизируем компании
      await syncCompaniesFromLiteLLM();
      // Затем синхронизируем модели из model group
      await syncModelsFromModelGroup();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при синхронизации моделей из model group');
    } finally {
      setSyncing(false);
    }
  };

  const renderModelGroups = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">LiteLLM модели</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSyncFromModelGroup}
            disabled={syncing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Синхронизация...' : 'Синхронизировать в БД'}
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Обновить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelGroups.map((group) => (
          <div key={group.model_group} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{group.model_group}</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Провайдер: {group.providers.join(', ')}</div>
                  <div>Режим: {group.mode}</div>
                  <div>Входные токены: {formatNumber(group.max_input_tokens)}</div>
                  <div>Выходные токены: {formatNumber(group.max_output_tokens)}</div>
                  <div>Стоимость входа: {formatCurrency(group.input_cost_per_token)}</div>
                  <div>Стоимость выхода: {formatCurrency(group.output_cost_per_token)}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {group.supports_vision && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Видение
                </span>
              )}
              {group.supports_function_calling && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Функции
                </span>
              )}
              {group.supports_reasoning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Рассуждения
                </span>
              )}
              {group.supports_web_search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Веб-поиск
                </span>
              )}
              {/* Добавляем отображение кэша и инструментов */}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Кэш
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Инструменты
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Модели в БД</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Синхронизация...' : 'Синхронизировать'}
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Обновить
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить модель
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {models.map((model) => (
            <li key={model.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{model.name}</h4>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        model.model_config 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.model_config ? 'В БД' : 'Внешняя'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {model.external_id && (
                        <div>Модельное имя: {model.external_id}</div>
                      )}
                      <div>Провайдер: {model.providers}</div>
                      <div>Режим: {model.mode}</div>
                    <div className="flex space-x-4 mt-1">
                      <span>Входные токены: {model.max_input_tokens ? formatNumber(model.max_input_tokens) : 'Не указано'}</span>
                      <span>Выходные токены: {model.max_output_tokens ? formatNumber(model.max_output_tokens) : 'Не указано'}</span>
                    </div>
                    <div className="flex space-x-4 mt-1">
                      <span>Стоимость входа: {formatCurrency(model.model_config?.input_token_cost || 0)} за токен</span>
                      <span>Стоимость выхода: {formatCurrency(model.model_config?.output_token_cost || 0)} за токен</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.supports_vision && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Видение
                      </span>
                    )}
                    {model.supports_function_calling && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Функции
                      </span>
                    )}
                    {model.supports_reasoning && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Рассуждения
                      </span>
                    )}
                    {model.supports_web_search && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Веб-поиск
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowDetailsModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowEditModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(model.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Управление моделями</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Навигация по вкладкам */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            LiteLLM модели
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Модели в БД
          </button>
        </nav>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Загрузка */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Загрузка...</span>
        </div>
      ) : (
        <>
          {activeTab === 'groups' && renderModelGroups()}
          {activeTab === 'models' && renderModels()}
        </>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Удалить модель
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Вы уверены, что хотите удалить эту модель? Это действие нельзя отменить.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setModelToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteModel}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания модели */}
      {showCreateModal && (
        <CreateModelModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateModel}
        />
      )}

      {/* Модальное окно редактирования модели */}
      {showEditModal && selectedModel && (
        <EditModelModal
          model={selectedModel}
          rateLimits={rateLimits}
          tiers={tiers}
          onClose={() => {
            setShowEditModal(false);
            setSelectedModel(null);
          }}
          onSubmit={handleUpdateModel}
        />
      )}

      {/* Модальное окно деталей модели */}
      {showDetailsModal && selectedModel && (
        <ModelDetailsModal
          model={selectedModel}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedModel(null);
          }}
        />
      )}
    </div>
  );
};

// Компонент для создания модели
const CreateModelModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: CreateModelRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateModelRequest>({
    model_name: '',
    litellm_params: {},
    model_info: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Создать модель</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название модели
            </label>
            <input
              type="text"
              value={formData.model_name}
              onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LiteLLM параметры (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.litellm_params, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, litellm_params: params }));
                } catch {
                  // Ignore JSON parse errors while typing
                }
              }}
              rows={8}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder='{"custom_llm_provider": "anthropic", "model": "claude-3-sonnet-20240229"}'
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для редактирования модели
const EditModelModal: React.FC<{
  model: DBModel;
  rateLimits: RateLimit[];
  tiers: Tier[];
  onClose: () => void;
  onSubmit: (data: UpdateModelRequest) => void;
}> = ({ model, rateLimits, tiers, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateModelRequest>({
    model_id: model.id,
    model_name: model.name,
    model_info: {
      // Основные параметры
      key: model.supported_openai_params,
      max_tokens: model.max_input_tokens || 0,
      max_input_tokens: model.max_input_tokens || 0,
      max_output_tokens: model.max_output_tokens || 0,
      mode: model.mode,
      litellm_provider: model.providers,
      
      // Стоимость токенов
      input_cost_per_token: model.model_config?.input_token_cost || 0,
      output_cost_per_token: model.model_config?.output_token_cost || 0,
      
      // Поддержка функций
      supports_vision: model.supports_vision || false,
      supports_function_calling: model.supports_function_calling || false,
      supports_web_search: model.supports_web_search || false,
      supports_reasoning: model.supports_reasoning || false,
    },
  });

  // Состояние для описания и особенностей
  const [description, setDescription] = useState(model.description || '');
  const [features, setFeatures] = useState(model.features || '');
  const [isEnabled, setIsEnabled] = useState(model.model_config?.is_enabled || false);
  const [isFree, setIsFree] = useState(model.model_config?.is_free || false);

  // Получаем rate limits для этой модели
  const modelRateLimits = rateLimits.filter(limit => limit.model_id === model.id);

  // Состояние для редактирования rate limits
  const [editingRateLimits, setEditingRateLimits] = useState<{[tierID: string]: RateLimit}>({});
  const [savingRateLimit, setSavingRateLimit] = useState<{[tierID: string]: boolean}>({});

  // Инициализируем состояние rate limits
  useEffect(() => {
    const initialRateLimits: {[tierID: string]: RateLimit} = {};
    
    // Добавляем существующие rate limits
    modelRateLimits.forEach(limit => {
      initialRateLimits[limit.tier_id] = { ...limit };
    });
    
    // Добавляем пустые rate limits для тарифов без лимитов
    tiers.forEach(tier => {
      if (!initialRateLimits[tier.id]) {
        initialRateLimits[tier.id] = {
          id: '',
          model_id: model.id,
          tier_id: tier.id,
          requests_per_minute: 0,
          requests_per_day: 0,
          tokens_per_minute: 0,
          tokens_per_day: 0,
          created_at: '',
          updated_at: '',
          tier: tier
        };
      }
    });
    
    setEditingRateLimits(initialRateLimits);
  }, [modelRateLimits, tiers, model.id]);

  const handleRateLimitChange = (tierID: string, field: keyof RateLimit, value: number) => {
    setEditingRateLimits(prev => ({
      ...prev,
      [tierID]: {
        ...prev[tierID],
        [field]: isNaN(value) ? 0 : value
      }
    }));
  };

  const saveRateLimit = async (tierID: string) => {
    const rateLimit = editingRateLimits[tierID];
    if (!rateLimit) return;

    setSavingRateLimit(prev => ({ ...prev, [tierID]: true }));

    try {
      let savedRateLimit: RateLimit;
      if (rateLimit.id) {
        // Обновляем существующий rate limit
        const response = await adminAPI.updateRateLimit(rateLimit.id, {
          requests_per_minute: rateLimit.requests_per_minute,
          requests_per_day: rateLimit.requests_per_day,
          tokens_per_minute: rateLimit.tokens_per_minute,
          tokens_per_day: rateLimit.tokens_per_day,
        });
        savedRateLimit = response.data.data;
      } else {
        // Создаем новый rate limit
        const response = await adminAPI.createRateLimit({
          model_id: model.id,
          tier_id: tierID,
          requests_per_minute: rateLimit.requests_per_minute,
          requests_per_day: rateLimit.requests_per_day,
          tokens_per_minute: rateLimit.tokens_per_minute,
          tokens_per_day: rateLimit.tokens_per_day,
        });
        savedRateLimit = response.data.data;
      }
      
      // Обновляем локальное состояние с сохраненными данными
      setEditingRateLimits(prev => ({
        ...prev,
        [tierID]: {
          ...savedRateLimit,
          tier: tiers.find(t => t.id === tierID)
        }
      }));
      
      alert('Лимиты успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении rate limit:', error);
      alert('Ошибка при сохранении лимитов');
    } finally {
      setSavingRateLimit(prev => ({ ...prev, [tierID]: false }));
    }
  };

  const deleteRateLimit = async (tierID: string) => {
    const rateLimit = editingRateLimits[tierID];
    if (!rateLimit?.id) return;

    if (!window.confirm('Вы уверены, что хотите удалить этот лимит?')) return;

    try {
      await adminAPI.deleteRateLimit(rateLimit.id);
      
      // Сбрасываем rate limit для этого тарифа
      setEditingRateLimits(prev => ({
        ...prev,
        [tierID]: {
          id: '',
          model_id: model.id,
          tier_id: tierID,
          requests_per_minute: 0,
          requests_per_day: 0,
          tokens_per_minute: 0,
          tokens_per_day: 0,
          created_at: '',
          updated_at: '',
          tier: tiers.find(t => t.id === tierID)
        }
      }));
      
      alert('Лимит успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении rate limit:', error);
      alert('Ошибка при удалении лимита');
    }
  };

  // Функция для получения иконки модели
  const getModelIcon = (modelName: string) => {
    if (modelName.toLowerCase().includes('gpt') || modelName.toLowerCase().includes('openai')) {
      return '🤖';
    }
    if (modelName.toLowerCase().includes('claude')) {
      return '🧠';
    }
    if (modelName.toLowerCase().includes('gemini')) {
      return '💎';
    }
    if (modelName.toLowerCase().includes('mistral')) {
      return '🌪️';
    }
    return '⚡';
  };

  const getStatusBadge = () => {
    if (!isEnabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-4 h-4 mr-1" />
          Недоступна
        </span>
      );
    }
    
    if (isFree) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Бесплатно
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <CpuChipIcon className="w-4 h-4 mr-1" />
        Платно
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Обновляем formData с новыми значениями
    const updatedFormData = {
      ...formData,
      model_name: formData.model_name,
      // Добавляем описание и особенности в отдельные поля
      description,
      features,
      model_config: {
        is_enabled: isEnabled,
        is_free: isFree,
        input_token_cost: formData.model_info?.input_cost_per_token || 0,
        output_token_cost: formData.model_info?.output_cost_per_token || 0,
      }
    };
    onSubmit(updatedFormData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Редактировать модель</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Заголовок модели */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 text-2xl">
                  {getModelIcon(formData.model_name || model.name)}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.model_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                    className="text-2xl font-bold text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                    placeholder="Название модели"
                  />
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="mr-4">ID: {model.external_id}</span>
                    <span>Компания: {model.company?.name || 'Не указана'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Включена</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Бесплатная</span>
                </label>
              </div>
            </div>

            {/* Описание */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Описание модели..."
              />
            </div>

            {/* Особенности */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особенности
              </label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                rows={2}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Особенности модели (через запятую)..."
              />
            </div>

            {/* Возможности модели */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Возможности модели</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.model_info?.supports_vision || false}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      model_info: { 
                        ...prev.model_info, 
                        supports_vision: e.target.checked
                      } 
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Видение</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.model_info?.supports_function_calling || false}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      model_info: { 
                        ...prev.model_info, 
                        supports_function_calling: e.target.checked
                      } 
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Функции</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.model_info?.supports_reasoning || false}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      model_info: { 
                        ...prev.model_info, 
                        supports_reasoning: e.target.checked
                      } 
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Рассуждения</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.model_info?.supports_web_search || false}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      model_info: { 
                        ...prev.model_info, 
                        supports_web_search: e.target.checked
                      } 
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Веб-поиск</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Стоимость токенов */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Стоимость токенов</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стоимость входных токенов (за 1 токен)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.model_info?.input_cost_per_token || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    model_info: { 
                      ...prev.model_info, 
                      input_cost_per_token: parseFloat(e.target.value) || 0
                    } 
                  }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000030"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Текущая: {formatCurrency(model.model_config?.input_token_cost || 0)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стоимость выходных токенов (за 1 токен)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.model_info?.output_cost_per_token || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    model_info: { 
                      ...prev.model_info, 
                      output_cost_per_token: parseFloat(e.target.value) || 0
                    } 
                  }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000060"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Текущая: {formatCurrency(model.model_config?.output_token_cost || 0)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимум входных токенов
                </label>
                <input
                  type="number"
                  value={formData.model_info?.max_input_tokens || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    model_info: { 
                      ...prev.model_info, 
                      max_input_tokens: e.target.value ? parseInt(e.target.value) : 0
                    } 
                  }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8192"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Текущий: {model.max_input_tokens ? formatNumber(model.max_input_tokens) : 'Не указано'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимум выходных токенов
                </label>
                <input
                  type="number"
                  value={formData.model_info?.max_output_tokens || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    model_info: { 
                      ...prev.model_info, 
                      max_output_tokens: e.target.value ? parseInt(e.target.value) : 0
                    } 
                  }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4096"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Текущий: {model.max_output_tokens ? formatNumber(model.max_output_tokens) : 'Не указано'}
                </p>
              </div>
            </div>
          </div>

          {/* Rate limits по тарифам */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Лимиты по тарифным планам</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Тариф</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Запросов/мин</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Запросов/день</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Токенов/мин</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Токенов/день</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => {
                    const rateLimit = editingRateLimits[tier.id];
                    if (!rateLimit) return null;
                    
                    return (
                      <tr key={tier.id} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              tier.is_free 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {tier.name}
                            </span>
                            {tier.price > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                ${tier.price}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-900 text-center">
                          <input
                            type="number"
                            min="0"
                            value={rateLimit.requests_per_minute === 0 ? '' : rateLimit.requests_per_minute}
                            onChange={(e) => handleRateLimitChange(tier.id, 'requests_per_minute', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-900 text-center">
                          <input
                            type="number"
                            min="0"
                            value={rateLimit.requests_per_day === 0 ? '' : rateLimit.requests_per_day}
                            onChange={(e) => handleRateLimitChange(tier.id, 'requests_per_day', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-900 text-center">
                          <input
                            type="number"
                            min="0"
                            value={rateLimit.tokens_per_minute === 0 ? '' : rateLimit.tokens_per_minute}
                            onChange={(e) => handleRateLimitChange(tier.id, 'tokens_per_minute', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-900 text-center">
                          <input
                            type="number"
                            min="0"
                            value={rateLimit.tokens_per_day === 0 ? '' : rateLimit.tokens_per_day}
                            onChange={(e) => handleRateLimitChange(tier.id, 'tokens_per_day', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => saveRateLimit(tier.id)}
                              disabled={savingRateLimit[tier.id]}
                              className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {savingRateLimit[tier.id] ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            {rateLimit.id && (
                              <button
                                type="button"
                                onClick={() => deleteRateLimit(tier.id)}
                                disabled={savingRateLimit[tier.id]}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {tiers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Тарифы не настроены
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>• Значение 0 означает отсутствие лимита</p>
              <p>• Изменения сохраняются индивидуально для каждого тарифа</p>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для просмотра деталей модели
const ModelDetailsModal: React.FC<{
  model: DBModel;
  onClose: () => void;
}> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Основная информация */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{model.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ID модели:</span>
                <p className="text-sm text-gray-900">{model.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Модельное имя:</span>
                <p className="text-sm text-gray-900">{model.external_id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Провайдер:</span>
                <p className="text-sm text-gray-900">{model.providers}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Режим:</span>
                <p className="text-sm text-gray-900">{model.mode}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Компания:</span>
                <p className="text-sm text-gray-900">{model.company?.name || 'Не указана'}</p>
              </div>
            </div>
          </div>

          {/* Стоимость */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-900 mb-2">Стоимость</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Входные токены:</span>
                <p className="text-sm text-gray-900">{formatCurrency(model.model_config?.input_token_cost || 0)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Выходные токены:</span>
                <p className="text-sm text-gray-900">{formatCurrency(model.model_config?.output_token_cost || 0)}</p>
              </div>
            </div>
          </div>

          {/* Лимиты */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-900 mb-2">Лимиты</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Максимум входных токенов:</span>
                <p className="text-sm text-gray-900">{model.max_input_tokens ? formatNumber(model.max_input_tokens) : 'Не указано'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Максимум выходных токенов:</span>
                <p className="text-sm text-gray-900">{model.max_output_tokens ? formatNumber(model.max_output_tokens) : 'Не указано'}</p>
              </div>
            </div>
          </div>

          {/* Поддержка функций */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-900 mb-2">Поддержка функций</h5>
            <div className="flex flex-wrap gap-2">
              {model.supports_vision && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Видение
                </span>
              )}
              {model.supports_function_calling && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Функции
                </span>
              )}
              {model.supports_reasoning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Рассуждения
                </span>
              )}
              {model.supports_web_search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Веб-поиск
                </span>
              )}
            </div>
          </div>

          {/* Описание */}
          {model.description && (
            <div className="mt-6">
              <h5 className="text-md font-medium text-gray-900 mb-2">Описание</h5>
              <p className="text-sm text-gray-700">{model.description}</p>
            </div>
          )}

          {/* Особенности */}
          {model.features && (
            <div className="mt-6">
              <h5 className="text-md font-medium text-gray-900 mb-2">Особенности</h5>
              <p className="text-sm text-gray-700">{model.features}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
  
export default ModelsManagement; 