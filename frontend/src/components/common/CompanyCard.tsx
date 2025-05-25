import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  CpuChipIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  index?: number;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/companies/${company.id}`}>
        <div className="glass-card p-6 h-full card-hover">
          {/* Логотип компании */}
          <div className="flex items-center justify-center mb-4">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="w-16 h-16 object-contain rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Название компании */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2 group-hover:text-orange-600 transition-colors duration-300">
            {company.name}
          </h3>

          {/* Описание */}
          {company.description && (
            <p className="text-gray-600 text-sm text-center mb-4 line-clamp-3">
              {company.description}
            </p>
          )}

          {/* Статистика */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <CpuChipIcon className="w-4 h-4" />
              <span className="text-sm">{company.modelsCount || 0} моделей</span>
            </div>
          </div>

          {/* Кнопка перехода */}
          <div className="flex items-center justify-center text-orange-500 group-hover:text-orange-600 transition-colors duration-300">
            <span className="text-sm font-medium">Посмотреть модели</span>
            <ArrowRightIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CompanyCard; 