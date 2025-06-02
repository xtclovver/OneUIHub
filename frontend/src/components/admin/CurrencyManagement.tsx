import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useCurrency } from '../../hooks/useCurrency';
import { ExchangeRate, Currency } from '../../types';

interface CurrencyManagementProps {
  onClose: () => void;
}

const CurrencyManagement: React.FC<CurrencyManagementProps> = ({ onClose }) => {
  const { 
    exchangeRates, 
    currencies, 
    loading, 
    updateExchangeRates, 
    refetch 
  } = useCurrency();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Получаем время последнего обновления
    if (exchangeRates.length > 0) {
      const latestUpdate = exchangeRates.reduce((latest, rate) => {
        const rateDate = new Date(rate.updated_at);
        return rateDate > latest ? rateDate : latest;
      }, new Date(0));
      
      setLastUpdate(latestUpdate.toLocaleString('ru-RU'));
    }
  }, [exchangeRates]);

  const handleUpdateRates = async () => {
    setIsUpdating(true);
    setUpdateStatus(null);
    
    try {
      const success = await updateExchangeRates();
      if (success) {
        setUpdateStatus('success');
        setLastUpdate(new Date().toLocaleString('ru-RU'));
      } else {
        setUpdateStatus('error');
      }
    } catch (error) {
      console.error('Ошибка при обновлении курсов:', error);
      setUpdateStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Заголовок */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 text-white mr-2" />
              <h2 className="text-xl font-semibold text-white">Управление валютами</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Статус обновления */}
          {updateStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center ${
                updateStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {updateStatus === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              )}
              {updateStatus === 'success' 
                ? 'Курсы валют успешно обновлены!' 
                : 'Ошибка при обновлении курсов валют. Проверьте API ключ.'}
            </motion.div>
          )}

          {/* Информация о последнем обновлении */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Последнее обновление: {lastUpdate || 'Никогда'}
                </span>
              </div>
              <button
                onClick={handleUpdateRates}
                disabled={isUpdating}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Обновление...' : 'Обновить курсы'}
              </button>
            </div>
          </div>

          {/* Поддерживаемые валюты */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Поддерживаемые валюты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currencies.map((currency) => (
                <div key={currency.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{currency.name}</h4>
                      <p className="text-sm text-gray-500">Код: {currency.id}</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      {currency.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Курсы валют */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Текущие курсы валют</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Загрузка курсов...</span>
              </div>
            ) : exchangeRates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border border-gray-200">
                        Из валюты
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border border-gray-200">
                        В валюту
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 border border-gray-200">
                        Курс
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border border-gray-200">
                        Обновлено
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchangeRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                          <div className="flex items-center">
                            <span className="font-medium">{rate.from_currency}</span>
                            {rate.from && (
                              <span className="ml-2 text-gray-500">({rate.from.symbol})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                          <div className="flex items-center">
                            <span className="font-medium">{rate.to_currency}</span>
                            {rate.to && (
                              <span className="ml-2 text-gray-500">({rate.to.symbol})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200 text-right">
                          <span className="font-mono font-medium">{formatRate(rate.rate)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 border border-gray-200">
                          {new Date(rate.updated_at).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Курсы валют не найдены</p>
                <p className="text-sm">Нажмите "Обновить курсы" для загрузки данных</p>
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Информация о курсах валют:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Курсы обновляются через внешний API (exchangerate-api.com)</li>
                  <li>Для работы требуется настроить API ключ в переменной EXCHANGE_RATE_API_KEY</li>
                  <li>Курсы используются для отображения цен моделей в рублях</li>
                  <li>Рекомендуется обновлять курсы ежедневно</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencyManagement; 