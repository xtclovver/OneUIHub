import React, { useState } from 'react';
import { 
  CpuChipIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: ChartBarIcon },
    { id: 'models', label: 'Модели', icon: CpuChipIcon },
    { id: 'companies', label: 'Компании', icon: BuildingOfficeIcon },
    { id: 'users', label: 'Пользователи', icon: UserGroupIcon },
    { id: 'billing', label: 'Биллинг', icon: CurrencyDollarIcon },
    { id: 'settings', label: 'Настройки', icon: Cog6ToothIcon },
  ];

  const stats = [
    { name: 'Всего пользователей', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Активных моделей', value: '45', change: '+3', changeType: 'positive' },
    { name: 'Запросов сегодня', value: '12,345', change: '+8%', changeType: 'positive' },
    { name: 'Доход за месяц', value: '$5,678', change: '+15%', changeType: 'positive' },
  ];

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

        {/* Содержимое вкладок */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div>
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.name}
                            </dt>
                            <dd className="flex items-baseline">
                              <div className={`text-sm font-medium ${
                                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stat.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Быстрые действия */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Синхронизировать модели
                  </button>
                  <button className="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                    Обновить курсы валют
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
                    Генерировать отчет
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Управление моделями</h3>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Синхронизировать с LiteLLM
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                    Добавить модель
                  </button>
                </div>
              </div>
              <div className="text-center py-12">
                <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Управление моделями</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет интерфейс для управления AI моделями
                </p>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Управление компаниями</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  Добавить компанию
                </button>
              </div>
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Управление компаниями</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет интерфейс для управления AI компаниями
                </p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Управление пользователями</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  Добавить пользователя
                </button>
              </div>
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Управление пользователями</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет интерфейс для управления пользователями
                </p>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Управление биллингом</h3>
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Биллинг и платежи</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будет интерфейс для управления биллингом
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки системы</h3>
              <div className="text-center py-12">
                <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Настройки</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Здесь будут системные настройки
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 