import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { fetchCompanies } from '../../redux/slices/companiesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CompanyCard from '../../components/common/CompanyCard';

const CompaniesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { companies, isLoading, error } = useSelector((state: RootState) => state.companies);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCompanies() as any);
  }, [dispatch]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            AI <span className="gradient-text">Компании</span>
          </h1>
          <p className="text-xl text-ai-gray-300 max-w-3xl mx-auto">
            Исследуйте ведущие компании в области искусственного интеллекта и их модели
          </p>
        </motion.div>

        {/* Поиск */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ai-gray-400" />
            <input
              type="text"
              placeholder="Поиск компаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>
        </motion.div>

        {/* Контент */}
        {isLoading ? (
          <LoadingSpinner text="Загрузка компаний..." />
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
            {filteredCompanies.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Пустое состояние для поиска */}
        {!isLoading && !error && filteredCompanies.length === 0 && searchTerm && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <BuildingOfficeIcon className="w-16 h-16 text-ai-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Компании не найдены
            </h3>
            <p className="text-ai-gray-400">
              Попробуйте изменить поисковый запрос
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage; 