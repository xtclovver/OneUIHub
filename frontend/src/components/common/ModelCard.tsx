import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  CpuChipIcon, 
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Model } from '../../types';
import { RootState } from '../../redux/store';
import { useCurrency } from '../../hooks/useCurrency';

interface ModelCardProps {
  model: Model;
  index?: number;
  showCompany?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, index = 0, showCompany = false }) => {
  const { companies } = useSelector((state: RootState) => state.companies);
  const { getPriceInBothCurrencies, loading: currencyLoading } = useCurrency();
  
  const getCompanyName = () => {
    const company = companies.find(c => c.id === model.company_id);
    return company?.name || 'Неизвестная компания';
  };

  const getStatusBadge = () => {
    if (!model.config?.is_enabled) {
      return (
        <span className="status-badge status-disabled">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Недоступна
        </span>
      );
    }
    
    if (model.config?.is_free) {
      return (
        <span className="status-badge status-free">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Бесплатно
        </span>
      );
    }
    
    return (
      <span className="status-badge status-paid">
        <CurrencyDollarIcon className="w-3 h-3 mr-1" />
        Платно
      </span>
    );
  };

  const getModelIcon = () => {
    // Определяем иконку на основе типа модели
    if (model.name.toLowerCase().includes('gpt') || model.name.toLowerCase().includes('openai')) {
      return '🤖';
    }
    if (model.name.toLowerCase().includes('claude')) {
      return '🧠';
    }
    if (model.name.toLowerCase().includes('gemini')) {
      return '💎';
    }
    if (model.name.toLowerCase().includes('mistral')) {
      return '🌪️';
    }
    return '⚡';
  };

  const getProviders = (): string[] => {
    if (!model.providers) return [];
    try {
      return JSON.parse(model.providers);
    } catch {
      return [];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/models/${model.id}`}>
        <div className="glass-card p-6 h-full card-hover">
          {/* Заголовок с иконкой */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-ai rounded-lg flex items-center justify-center text-2xl">
                {getModelIcon()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  {model.name}
                </h3>
                {showCompany && (
                  <p className="text-gray-600 text-sm">{getCompanyName()}</p>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Описание */}
          {model.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {model.description}
            </p>
          )}

          {/* Особенности */}
          {model.features && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {model.features.split(',').slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    {feature.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Провайдеры */}
          {getProviders().length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Провайдеры:</p>
              <div className="flex flex-wrap gap-1">
                {getProviders().slice(0, 3).map((provider, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium"
                  >
                    {provider}
                  </span>
                ))}
                {getProviders().length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{getProviders().length - 3} еще
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Информация о стоимости */}
          {model.config && (
            <div className="space-y-2 mb-4">
              {model.config.input_token_cost && model.config.output_token_cost && !currencyLoading ? (
                <div className="space-y-3">
                  {/* Входящие токены */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-gray-600 text-xs">
                      <ArrowRightIcon className="w-3 h-3 rotate-180" />
                      <span>Вход/1K токенов:</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="text-gray-800 font-medium">
                        {getPriceInBothCurrencies(model.config.input_token_cost).usd}
                      </div>
                      <div className="text-gray-600">
                        {getPriceInBothCurrencies(model.config.input_token_cost).rub}
                      </div>
                    </div>
                  </div>
                  
                  {/* Исходящие токены */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-gray-600 text-xs">
                      <ArrowRightIcon className="w-3 h-3" />
                      <span>Выход/1K токенов:</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="text-gray-800 font-medium">
                        {getPriceInBothCurrencies(model.config.output_token_cost).usd}
                      </div>
                      <div className="text-gray-600">
                        {getPriceInBothCurrencies(model.config.output_token_cost).rub}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gray-600 text-xs">
                  <CurrencyDollarIcon className="w-3 h-3" />
                  <span>Стоимость уточняется</span>
                </div>
              )}
            </div>
          )}

          {/* Кнопка перехода */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-orange-600 group-hover:text-orange-700 transition-colors duration-300">
              <span className="text-sm font-medium">Подробнее</span>
              <ArrowRightIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            {/* Индикатор активности */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                model.config?.is_enabled ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                {model.config?.is_enabled ? 'Активна' : 'Неактивна'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ModelCard; 