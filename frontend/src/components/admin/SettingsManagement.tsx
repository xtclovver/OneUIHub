import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  KeyIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SettingsManagementProps {
  onClose?: () => void;
}

interface SystemSettings {
  litellm: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    retries: number;
  };
  security: {
    jwtSecret: string;
    tokenExpiry: number;
    rateLimitEnabled: boolean;
    maxRequestsPerMinute: number;
  };
  notifications: {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  billing: {
    currency: string;
    taxRate: number;
    freeTrialDays: number;
  };
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'litellm' | 'security' | 'notifications' | 'billing'>('litellm');
  const [settings, setSettings] = useState<SystemSettings>({
    litellm: {
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-cix7xI3fGYclgRwV-tzHYg',
      timeout: 30000,
      retries: 3,
    },
    security: {
      jwtSecret: '***hidden***',
      tokenExpiry: 24,
      rateLimitEnabled: true,
      maxRequestsPerMinute: 100,
    },
    notifications: {
      emailEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
    },
    billing: {
      currency: 'USD',
      taxRate: 0,
      freeTrialDays: 7,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Здесь будет API вызов для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
      setSuccess('Настройки успешно сохранены');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Здесь будет API вызов для тестирования соединения с LiteLLM
      await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация API вызова
      setSuccess('Соединение с LiteLLM успешно установлено');
    } catch (err) {
      setError('Не удалось подключиться к LiteLLM');
    } finally {
      setTestingConnection(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const renderLiteLLMSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки LiteLLM</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URL
            </label>
            <input
              type="url"
              value={settings.litellm.baseUrl}
              onChange={(e) => updateSettings('litellm', 'baseUrl', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="http://localhost:4000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={settings.litellm.apiKey}
              onChange={(e) => updateSettings('litellm', 'apiKey', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="sk-..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (мс)
            </label>
            <input
              type="number"
              value={settings.litellm.timeout}
              onChange={(e) => updateSettings('litellm', 'timeout', parseInt(e.target.value))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              min="1000"
              max="300000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество повторов
            </label>
            <input
              type="number"
              value={settings.litellm.retries}
              onChange={(e) => updateSettings('litellm', 'retries', parseInt(e.target.value))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="10"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ServerIcon className={`h-4 w-4 mr-2 ${testingConnection ? 'animate-pulse' : ''}`} />
            {testingConnection ? 'Тестирование...' : 'Тестировать соединение'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Настройки системы</h2>
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
            onClick={() => setActiveTab('litellm')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'litellm'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ServerIcon className="h-5 w-5 inline mr-2" />
            LiteLLM
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
            Безопасность
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BellIcon className="h-5 w-5 inline mr-2" />
            Уведомления
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            Биллинг
          </button>
        </nav>
      </div>

      {/* Уведомления */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Успех</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Содержимое вкладок */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'litellm' && renderLiteLLMSettings()}
        {activeTab === 'security' && <div>Настройки безопасности (в разработке)</div>}
        {activeTab === 'notifications' && <div>Настройки уведомлений (в разработке)</div>}
        {activeTab === 'billing' && <div>Настройки биллинга (в разработке)</div>}
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement; 