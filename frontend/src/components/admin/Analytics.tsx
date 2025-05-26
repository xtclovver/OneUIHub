import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  getAdminStats,
  getGlobalSpend,
  getSpendLogs,
  getGlobalActivity,
  formatCurrency,
  formatNumber,
} from '../../api/admin';
import { AdminStats, GlobalSpend, SpendLog, GlobalActivity } from '../../types/admin';

interface AnalyticsProps {
  onClose?: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onClose }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [globalSpend, setGlobalSpend] = useState<GlobalSpend | null>(null);
  const [spendLogs, setSpendLogs] = useState<SpendLog[]>([]);
  const [activity, setActivity] = useState<GlobalActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, spendData, logsData, activityData] = await Promise.all([
        getAdminStats(),
        getGlobalSpend(),
        getSpendLogs(),
        getGlobalActivity(dateRange.start, dateRange.end),
      ]);

      setStats(statsData);
      setGlobalSpend(spendData);
      setSpendLogs(logsData);
      setActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">👥</div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Всего пользователей
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatNumber(stats?.totalUsers || 0)}
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
              <div className="text-2xl">🤖</div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Активных моделей
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatNumber(stats?.activeModels || 0)}
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
              <div className="text-2xl">📊</div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Запросов сегодня
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatNumber(stats?.requestsToday || 0)}
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
              <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Общие расходы
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(stats?.totalSpend || 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityChart = () => (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Активность за период</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {activity && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Всего запросов</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatNumber(activity.sum_api_requests)}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Всего токенов</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatNumber(activity.sum_total_tokens)}
                  </p>
                </div>
                <div className="text-2xl">🔤</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Ежедневная активность</h4>
            <div className="space-y-2">
              {activity.daily_data.map((day, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-900">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Запросы: {formatNumber(day.api_requests)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Токены: {formatNumber(day.total_tokens)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSpendChart = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">История расходов</h3>
      
      {globalSpend && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Текущие расходы</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(globalSpend.spend)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Максимальный бюджет</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(globalSpend.max_budget)}
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Ежедневные расходы</h4>
        {spendLogs.map((log, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-900">{log.date}</span>
            <span className="text-sm text-gray-600">
              {formatCurrency(log.spend)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Аналитика и статистика</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Обновить
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          )}
        </div>
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
          {renderStatsCards()}
          {renderActivityChart()}
          {renderSpendChart()}
        </>
      )}
    </div>
  );
};

export default Analytics; 