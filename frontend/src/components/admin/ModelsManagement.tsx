import React, { useState, useEffect } from 'react';
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
  getModelsInfo,
  createModel,
  updateModel,
  deleteModel,
  formatCurrency,
  formatNumber,
} from '../../api/admin';
import { ModelGroupInfo, LiteLLMModel, CreateModelRequest, UpdateModelRequest } from '../../types/admin';

interface ModelsManagementProps {
  onClose?: () => void;
}

const ModelsManagement: React.FC<ModelsManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'models'>('groups');
  const [modelGroups, setModelGroups] = useState<ModelGroupInfo[]>([]);
  const [models, setModels] = useState<LiteLLMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<LiteLLMModel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'groups') {
        const response = await getModelGroupInfo();
        setModelGroups(response.data);
      } else {
        const response = await getModelsInfo();
        setModels(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

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

  const renderModelGroups = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Группы моделей</h3>
        <button
          onClick={loadData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Обновить
        </button>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Модели</h3>
        <div className="flex space-x-2">
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
            <li key={model.model_info.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{model.model_name}</h4>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      model.model_info.db_model 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {model.model_info.db_model ? 'В БД' : 'Внешняя'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <div>Провайдер: {model.model_info.litellm_provider}</div>
                    <div>Режим: {model.model_info.mode}</div>
                    <div className="flex space-x-4 mt-1">
                      <span>Входные токены: {formatNumber(model.model_info.max_input_tokens)}</span>
                      <span>Выходные токены: {formatNumber(model.model_info.max_output_tokens)}</span>
                    </div>
                    <div className="flex space-x-4 mt-1">
                      <span>Стоимость входа: {formatCurrency(model.model_info.input_cost_per_token)}</span>
                      <span>Стоимость выхода: {formatCurrency(model.model_info.output_cost_per_token)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.model_info.supports_vision && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Видение
                      </span>
                    )}
                    {model.model_info.supports_function_calling && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Функции
                      </span>
                    )}
                    {model.model_info.supports_reasoning && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Рассуждения
                      </span>
                    )}
                    {model.model_info.supports_web_search && (
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
                    onClick={() => openDeleteModal(model.model_info.id)}
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
            Группы моделей
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Модели
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
  model: LiteLLMModel;
  onClose: () => void;
  onSubmit: (data: UpdateModelRequest) => void;
}> = ({ model, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateModelRequest>({
    model_id: model.model_info.id,
    model_name: model.model_name,
    model_info: {
      input_cost_per_token: model.model_info.input_cost_per_token,
      output_cost_per_token: model.model_info.output_cost_per_token,
      max_tokens: model.model_info.max_tokens,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Редактировать модель</h3>
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
              value={formData.model_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость входных токенов
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.model_info?.input_cost_per_token || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_info: { 
                    ...prev.model_info, 
                    input_cost_per_token: parseFloat(e.target.value) 
                  } 
                }))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость выходных токенов
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.model_info?.output_cost_per_token || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_info: { 
                    ...prev.model_info, 
                    output_cost_per_token: parseFloat(e.target.value) 
                  } 
                }))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Максимум токенов
              </label>
              <input
                type="number"
                value={formData.model_info?.max_tokens || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_info: { 
                    ...prev.model_info, 
                    max_tokens: parseInt(e.target.value) 
                  } 
                }))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для просмотра деталей модели
const ModelDetailsModal: React.FC<{
  model: LiteLLMModel;
  onClose: () => void;
}> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Детали модели</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{model.model_name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ID модели:</span>
                <p className="text-sm text-gray-900">{model.model_info.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Провайдер:</span>
                <p className="text-sm text-gray-900">{model.model_info.litellm_provider}</p>
              </div>
            </div>
          </div>

          {/* Стоимость */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-2">Стоимость</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Входные токены:</span>
                <p className="text-sm text-gray-900">${model.model_info.input_cost_per_token}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Выходные токены:</span>
                <p className="text-sm text-gray-900">${model.model_info.output_cost_per_token}</p>
              </div>
            </div>
          </div>

          {/* Лимиты */}
          {model.model_info.max_tokens && (
            <div>
              <h5 className="text-md font-medium text-gray-900 mb-2">Лимиты</h5>
              <div>
                <span className="text-sm font-medium text-gray-500">Максимум токенов:</span>
                <p className="text-sm text-gray-900">{model.model_info.max_tokens.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* LiteLLM параметры */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-2">LiteLLM параметры</h5>
            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(model.litellm_params, null, 2)}
            </pre>
          </div>
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