import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { getAdminStats, formatCurrency, formatNumber } from '../../api/admin';
import { AdminStats } from '../../types/admin';
import ModelsManagement from '../../components/admin/ModelsManagement';
import UsersManagement from '../../components/admin/UsersManagement';
import Analytics from '../../components/admin/Analytics';
import CompaniesManagement from '../../components/admin/CompaniesManagement';
import SettingsManagement from '../../components/admin/SettingsManagement';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: ChartBarIcon },
    { id: 'models', label: 'Модели', icon: CpuChipIcon },
    { id: 'users', label: 'Пользователи', icon: UserGroupIcon },
    { id: 'analytics', label: 'Аналитика', icon: ChartBarIcon },
    { id: 'companies', label: 'Компании', icon: BuildingOfficeIcon },
    { id: 'billing', label: 'Биллинг', icon: CurrencyDollarIcon },
    { id: 'settings', label: 'Настройки', icon: Cog6ToothIcon },
  ];

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div>
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Всего пользователей
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats ? formatNumber(stats.totalUsers) : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CpuChipIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Активных моделей
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats ? formatNumber(stats.activeModels) : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Запросов сегодня
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats ? formatNumber(stats.requestsToday) : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Общие расходы
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats ? formatCurrency(stats.totalSpend) : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Всего запросов
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats ? formatNumber(stats.totalRequests) : '—'}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Всего токенов
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats ? formatNumber(stats.totalTokens) : '—'}
            </dd>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('models')}
            className="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Управление моделями
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Управление пользователями
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Просмотр аналитики
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string, icon: React.ComponentType<any>) => {
    const Icon = icon;
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
          <p className="mt-2 text-gray-600">Управление системой OneAI Hub</p>
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

        {/* Ошибки */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Содержимое вкладок */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Загрузка статистики...</span>
                </div>
              ) : (
                renderOverview()
              )}
            </>
          )}

          {activeTab === 'models' && <ModelsManagement />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'companies' && <CompaniesManagement />}

          {activeTab === 'billing' && renderPlaceholder(
            'Биллинг и платежи',
            'Здесь будет интерфейс для управления биллингом',
            CurrencyDollarIcon
          )}

          {activeTab === 'settings' && <SettingsManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 