import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import {
  createCompany,
  updateCompany,
  deleteCompany,
  syncCompaniesFromLiteLLM,
  formatDate,
  addModelToCompany,
} from '../../api/admin';
import { companiesAPI } from '../../api/companies';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../../types/admin';

interface CompaniesManagementProps {
  onClose?: () => void;
}

const CompaniesManagement: React.FC<CompaniesManagementProps> = ({ onClose }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [companyForModel, setCompanyForModel] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await companiesAPI.getAll();
      setCompanies(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncCompaniesFromLiteLLM();
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateCompany = async (data: CreateCompanyRequest) => {
    setError(null);
    try {
      await createCompany(data);
      setShowCreateModal(false);
      loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании компании');
    }
  };

  const handleUpdateCompany = async (data: UpdateCompanyRequest) => {
    if (!selectedCompany) return;

    setError(null);
    try {
      await updateCompany(selectedCompany.id, data);
      setShowEditModal(false);
      setSelectedCompany(null);
      loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении компании');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    setError(null);
    try {
      await deleteCompany(companyToDelete);
      setShowDeleteModal(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении компании');
    }
  };

  const openDeleteModal = (companyId: string) => {
    setCompanyToDelete(companyId);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const openAddModelModal = (company: Company) => {
    setCompanyForModel(company);
    setShowAddModelModal(true);
  };

  const handleAddModel = async (data: any) => {
    if (!companyForModel) return;
    
    setError(null);
    try {
      await addModelToCompany(companyForModel.id, data);
      setShowAddModelModal(false);
      setCompanyForModel(null);
      loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении модели');
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Управление компаниями</h2>
          <p className="text-sm text-gray-600 mt-1">
            Управление компаниями-провайдерами AI моделей
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Синхронизация...' : 'Синхронизировать'}
          </button>
          <button
            onClick={loadCompanies}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Обновить
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Добавить компанию
          </button>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Список компаний */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Загрузка компаний...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">
                      Создана: {formatDate(company.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {company.description && (
                <p className="text-sm text-gray-600 mb-4">{company.description}</p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openDetailsModal(company)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Детали"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                    title="Редактировать"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openAddModelModal(company)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Добавить модель"
                  >
                    <CpuChipIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(company.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {company.external_id && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Синхронизирована
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания компании */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCompany}
        />
      )}

      {/* Модальное окно редактирования компании */}
      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
          onSubmit={handleUpdateCompany}
        />
      )}

      {/* Модальное окно деталей компании */}
      {showDetailsModal && selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCompany(null);
          }}
        />
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
                Удалить компанию
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Вы уверены, что хотите удалить эту компанию? Это действие нельзя отменить.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCompanyToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteCompany}
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

      {/* Модальное окно добавления модели */}
      {showAddModelModal && companyForModel && (
        <AddModelModal
          company={companyForModel}
          onClose={() => {
            setShowAddModelModal(false);
            setCompanyForModel(null);
          }}
          onSubmit={handleAddModel}
        />
      )}
    </div>
  );
};

// Компонент для создания компании
const CreateCompanyModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: CreateCompanyRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    external_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Создать компанию</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название компании *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL логотипа
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Описание компании..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Внешний ID
            </label>
            <input
              type="text"
              value={formData.external_id}
              onChange={(e) => setFormData(prev => ({ ...prev, external_id: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="openai, anthropic, google..."
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

// Компонент для редактирования компании
const EditCompanyModal: React.FC<{
  company: Company;
  onClose: () => void;
  onSubmit: (data: UpdateCompanyRequest) => void;
}> = ({ company, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: company.name,
    logo_url: company.logo_url || '',
    description: company.description || '',
    external_id: company.external_id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Редактировать компанию</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название компании
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL логотипа
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Внешний ID
            </label>
            <input
              type="text"
              value={formData.external_id}
              onChange={(e) => setFormData(prev => ({ ...prev, external_id: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для просмотра деталей компании
const CompanyDetailsModal: React.FC<{
  company: Company;
  onClose: () => void;
}> = ({ company, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Детали компании</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="flex items-center space-x-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
            )}
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{company.name}</h4>
              <p className="text-sm text-gray-500">ID: {company.id}</p>
            </div>
          </div>

          {/* Детали */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Внешний ID:</span>
              <p className="text-sm text-gray-900">{company.external_id || 'Не указан'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Дата создания:</span>
              <p className="text-sm text-gray-900">
                {formatDate(company.created_at)}
              </p>
            </div>
          </div>

          {company.description && (
            <div>
              <span className="text-sm font-medium text-gray-500">Описание:</span>
              <p className="text-sm text-gray-900 mt-1">{company.description}</p>
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

// Компонент для добавления модели к компании
const AddModelModal: React.FC<{
  company: Company;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ company, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
    external_id: '',
    max_input_tokens: '',
    max_output_tokens: '',
    mode: 'chat',
    supports_parallel_function_calling: false,
    supports_vision: false,
    supports_web_search: false,
    supports_reasoning: false,
    supports_function_calling: false,
    input_token_cost: '',
    output_token_cost: '',
    is_free: false,
    is_enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      max_input_tokens: formData.max_input_tokens ? parseInt(formData.max_input_tokens) : undefined,
      max_output_tokens: formData.max_output_tokens ? parseInt(formData.max_output_tokens) : undefined,
      input_token_cost: formData.input_token_cost ? parseFloat(formData.input_token_cost) : undefined,
      output_token_cost: formData.output_token_cost ? parseFloat(formData.output_token_cost) : undefined,
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Добавить модель к компании "{company.name}"
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Основная информация</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название модели *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="GPT-4, Claude-3, Gemini Pro..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Внешний ID
                </label>
                <input
                  type="text"
                  value={formData.external_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_id: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="gpt-4, claude-3-sonnet..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Описание модели..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Особенности
              </label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Быстрая, точная, мультимодальная..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Режим
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="chat">Chat</option>
                <option value="completion">Completion</option>
                <option value="embedding">Embedding</option>
                <option value="image_generation">Image Generation</option>
              </select>
            </div>
          </div>

          {/* Лимиты токенов */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Лимиты токенов</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимум входных токенов
                </label>
                <input
                  type="number"
                  value={formData.max_input_tokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_input_tokens: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8192"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимум выходных токенов
                </label>
                <input
                  type="number"
                  value={formData.max_output_tokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_output_tokens: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4096"
                />
              </div>
            </div>
          </div>

          {/* Стоимость */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Стоимость</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Стоимость входных токенов (за токен)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.input_token_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, input_token_cost: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000030"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Стоимость выходных токенов (за токен)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.output_token_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, output_token_cost: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.000060"
                />
              </div>
            </div>
          </div>

          {/* Поддержка функций */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Поддержка функций</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.supports_vision}
                  onChange={(e) => setFormData(prev => ({ ...prev, supports_vision: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Поддержка видения</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.supports_function_calling}
                  onChange={(e) => setFormData(prev => ({ ...prev, supports_function_calling: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Вызов функций</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.supports_parallel_function_calling}
                  onChange={(e) => setFormData(prev => ({ ...prev, supports_parallel_function_calling: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Параллельные функции</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.supports_web_search}
                  onChange={(e) => setFormData(prev => ({ ...prev, supports_web_search: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Веб-поиск</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.supports_reasoning}
                  onChange={(e) => setFormData(prev => ({ ...prev, supports_reasoning: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Рассуждения</span>
              </label>
            </div>
          </div>

          {/* Настройки */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Настройки</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Бесплатная модель</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Модель включена</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              Добавить модель
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompaniesManagement; 