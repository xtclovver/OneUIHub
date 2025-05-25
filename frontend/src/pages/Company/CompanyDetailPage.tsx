import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { fetchCompanyById } from '../../redux/slices/companiesSlice';
import { fetchModels } from '../../redux/slices/modelsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ModelCard from '../../components/common/ModelCard';
import { ModelFilters } from '../../types';

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { selectedCompany, isLoading: companyLoading } = useSelector((state: RootState) => state.companies);
  const { models, isLoading: modelsLoading } = useSelector((state: RootState) => state.models);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ModelFilters>({});

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id) as any);
      dispatch(fetchModels({ company_id: id, ...filters }) as any);
    }
  }, [dispatch, id, filters]);

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

  if (companyLoading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <LoadingSpinner text="Загрузка информации о компании..." />
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-ai-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Компания не найдена
            </h3>
            <p className="text-ai-gray-400 mb-6">
              Возможно, компания была удалена или не существует
            </p>
            <Link to="/companies" className="btn-primary">
              Вернуться к компаниям
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
            to="/companies"
            className="inline-flex items-center text-ai-gray-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Назад к компаниям
          </Link>
        </motion.div>

        {/* Заголовок компании */}
        <motion.div
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 glass-card flex items-center justify-center mr-6">
              {selectedCompany.logo_url ? (
                <img
                  src={selectedCompany.logo_url}
                  alt={`${selectedCompany.name} logo`}
                  className="w-16 h-16 object-contain rounded-lg"
                />
              ) : (
                <BuildingOfficeIcon className="w-10 h-10 text-ai-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {selectedCompany.name}
              </h1>
              <div className="flex items-center space-x-4 text-ai-gray-400">
                <div className="flex items-center space-x-1">
                  <CpuChipIcon className="w-4 h-4" />
                  <span>{filteredModels.length} моделей</span>
                </div>
              </div>
            </div>
          </div>

          {selectedCompany.description && (
            <p className="text-ai-gray-300 text-lg leading-relaxed">
              {selectedCompany.description}
            </p>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Модели */}
        {modelsLoading ? (
          <LoadingSpinner text="Загрузка моделей..." />
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
                showCompany={false}
              />
            ))}
          </motion.div>
        )}

        {/* Пустое состояние */}
        {!modelsLoading && filteredModels.length === 0 && (
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
                : 'Модели этой компании будут добавлены в ближайшее время'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailPage; 