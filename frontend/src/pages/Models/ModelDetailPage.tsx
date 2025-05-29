import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { fetchModelById, clearSelectedModel } from '../../redux/slices/modelsSlice';
import { modelsAPI } from '../../api/models';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ModelCapabilities from '../../components/common/ModelCapabilities';
import { RateLimit, Tier } from '../../types';

const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { selectedModel, isLoading } = useSelector((state: RootState) => state.models);

  useEffect(() => {
    if (id) {
      dispatch(fetchModelById(id) as any);
    }
    
    // Очищаем выбранную модель при размонтировании компонента
    return () => {
      dispatch(clearSelectedModel());
    };
  }, [dispatch, id]);

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
    if (!selectedModel?.model_config?.is_enabled) {
      return (
        <span className="status-badge status-disabled">
          <XCircleIcon className="w-4 h-4 mr-1" />
          Недоступна
        </span>
      );
    }
    
    if (selectedModel?.model_config?.is_free) {
      return (
        <span className="status-badge status-free">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Бесплатно
        </span>
      );
    }
    
    return (
      <span className="status-badge status-paid">
        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
        Платно
      </span>
    );
  };

  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rateLimitsResponse, tiersResponse] = await Promise.all([
          modelsAPI.getRateLimits(),
          modelsAPI.getTiers()
        ]);
        setRateLimits(rateLimitsResponse.data.data);
        setTiers(tiersResponse.data.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <LoadingSpinner text="Загрузка информации о модели..." />
        </div>
      </div>
    );
  }

  if (!selectedModel) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center py-12">
            <CpuChipIcon className="w-16 h-16 text-ai-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Модель не найдена
            </h3>
            <p className="text-ai-gray-400 mb-6">
              Возможно, модель была удалена или не существует
            </p>
            <Link to="/models" className="btn-primary">
              Вернуться к моделям
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Навигация */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/models"
            className="inline-flex items-center text-ai-gray-400 hover:text-gray-900 transition-colors duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Назад к моделям
          </Link>
        </motion.div>

        {/* Заголовок модели */}
        <motion.div
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-ai rounded-2xl flex items-center justify-center mr-6 text-3xl">
                {getModelIcon(selectedModel.name)}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {selectedModel.name}
                </h1>
                <Link
                  to={`/companies/${selectedModel.company_id}`}
                  className="flex items-center text-ai-gray-400 hover:text-ai-orange transition-colors duration-300"
                >
                  <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                  Перейти к компании
                </Link>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {selectedModel.description && (
            <p className="text-ai-gray-300 text-lg leading-relaxed mb-6">
              {selectedModel.description}
            </p>
          )}

          {/* Особенности */}
          {selectedModel.features && (
            <div className="mb-6">
              <h3 className="text-gray-900 font-semibold mb-3">Особенности:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedModel.features.split(',').map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-ai-gray-700 text-ai-gray-300"
                  >
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    {feature.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Стоимость */}
          {selectedModel.model_config && !selectedModel.model_config.is_free && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Входные токены</h4>
                <p className="text-3xl font-bold text-ai-orange">
                  ${((selectedModel.model_config.input_token_cost || 0) * 1000).toFixed(6)}
                </p>
                <p className="text-sm text-ai-gray-400">за 1K токенов</p>
              </div>
              
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Выходные токены</h4>
                <p className="text-3xl font-bold text-ai-orange">
                  ${((selectedModel.model_config.output_token_cost || 0) * 1000).toFixed(6)}
                </p>
                <p className="text-sm text-ai-gray-400">за 1K токенов</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Возможности модели */}
        <motion.div
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-6 h-6 text-ai-orange mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Возможности и характеристики</h2>
          </div>
          <ModelCapabilities model={selectedModel} />
        </motion.div>

        {/* Лимиты по тирам */}
        <motion.div
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center mb-6">
            <InformationCircleIcon className="w-6 h-6 text-ai-orange mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Лимиты по тарифным планам</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ai-gray-700">
                  <th className="table-header text-left">Тариф</th>
                  <th className="table-header text-center">Запросов/мин</th>
                  <th className="table-header text-center">Запросов/день</th>
                  <th className="table-header text-center">Токенов/мин</th>
                  <th className="table-header text-center">Токенов/день</th>
                  <th className="table-header text-center">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {rateLimits
                  .filter(limit => limit.model_id === selectedModel.id)
                  .map((limit, index) => {
                    const tier = tiers.find(t => t.id === limit.tier_id);
                    return (
                      <motion.tr
                        key={limit.id}
                        className="table-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <td className="table-cell">
                          <span className={`font-medium ${
                            tier?.name === 'Pro' ? 'text-ai-orange' : 'text-gray-900'
                          }`}>
                            {tier?.name || 'Неизвестный тариф'}
                          </span>
                          {tier?.name === 'Pro' && (
                            <span className="ml-2 text-xs bg-ai-orange text-white px-2 py-1 rounded-full">
                              Популярный
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-center">{limit.requests_per_minute?.toLocaleString() || '∞'}</td>
                        <td className="table-cell text-center">{limit.requests_per_day?.toLocaleString() || '∞'}</td>
                        <td className="table-cell text-center">{limit.tokens_per_minute?.toLocaleString() || '∞'}</td>
                        <td className="table-cell text-center">{limit.tokens_per_day?.toLocaleString() || '∞'}</td>
                        <td className="table-cell text-center">
                          {tier?.price === 0 ? 'Бесплатно' : 
                           typeof tier?.price === 'number' ? `$${tier.price}` : tier?.price || 'Не указано'}
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-ai-gray-800/50 rounded-lg">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-ai-blue mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-ai-gray-300">
                <p className="mb-2">
                  <strong>Примечание:</strong> Лимиты применяются к каждой модели отдельно.
                </p>
                <p>
                  При превышении лимитов запросы будут отклонены с кодом ошибки 429. 
                  Лимиты сбрасываются каждую минуту/день соответственно.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Действия */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link to="/register" className="btn-primary">
            Начать использовать
          </Link>
          <Link to="/docs" className="btn-secondary">
            Документация API
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ModelDetailPage; 