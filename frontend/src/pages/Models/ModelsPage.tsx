import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { fetchModels } from '../../redux/slices/modelsSlice';
import { fetchCompanies } from '../../redux/slices/companiesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ModelCard from '../../components/common/ModelCard';
import { ModelFilters } from '../../types';

const ModelsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { models, isLoading, error } = useSelector((state: RootState) => state.models);
  const { companies } = useSelector((state: RootState) => state.companies);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ModelFilters>({});

  useEffect(() => {
    dispatch(fetchModels(filters) as any);
    dispatch(fetchCompanies() as any);
  }, [dispatch, filters]);

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key: keyof ModelFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Заголовок */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            AI <span className="gradient-text">Модели</span>
          </h1>
          <p className="text-xl text-ai-gray-300 max-w-3xl mx-auto">
            Исследуйте и сравнивайте различные модели искусственного интеллекта
          </p>
        </motion.div>

        {/* Поиск и фильтры */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-gray-400" />
              <input
                type="text"
                placeholder="Поиск моделей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Фильтры
            </button>
          </div>

          {/* Панель фильтров */}
          {showFilters && (
            <motion.div
              className="glass-card p-6 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Компания
                  </label>
                  <select
                    value={filters.company_id || ''}
                    onChange={(e) => handleFilterChange('company_id', e.target.value || undefined)}
                    className="input-field w-full"
                  >
                    <option value="">Все компании</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Тип
                  </label>
                  <select
                    value={filters.is_free?.toString() || ''}
                    onChange={(e) => handleFilterChange('is_free', e.target.value ? e.target.value === 'true' : undefined)}
                    className="input-field w-full"
                  >
                    <option value="">Все модели</option>
                    <option value="true">Бесплатные</option>
                    <option value="false">Платные</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Статус
                  </label>
                  <select
                    value={filters.is_enabled?.toString() || ''}
                    onChange={(e) => handleFilterChange('is_enabled', e.target.value ? e.target.value === 'true' : undefined)}
                    className="input-field w-full"
                  >
                    <option value="">Все статусы</option>
                    <option value="true">Активные</option>
                    <option value="false">Неактивные</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="btn-ghost flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Очистить фильтры
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Контент */}
        {isLoading ? (
          <LoadingSpinner text="Загрузка моделей..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {filteredModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                showCompany={true}
              />
            ))}
          </motion.div>
        )}

        {/* Пустое состояние */}
        {!isLoading && !error && filteredModels.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CpuChipIcon className="w-16 h-16 text-ai-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || Object.keys(filters).length > 0 ? 'Модели не найдены' : 'Нет доступных моделей'}
            </h3>
            <p className="text-ai-gray-400">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'Попробуйте изменить поисковый запрос или фильтры'
                : 'Модели будут добавлены в ближайшее время'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModelsPage; 