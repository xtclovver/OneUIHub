import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  RocketLaunchIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  BoltIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { fetchCompanies } from '../../redux/slices/companiesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CompanyCard from '../../components/common/CompanyCard';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { companies, isLoading } = useSelector((state: RootState) => state.companies);

  useEffect(() => {
    dispatch(fetchCompanies() as any);
  }, [dispatch]);

  const features = [
    {
      icon: CpuChipIcon,
      title: 'Единый API',
      description: 'Доступ к множественным AI моделям через унифицированный интерфейс',
      color: 'text-orange-500'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Высокая производительность',
      description: 'Оптимизированные запросы и кэширование для максимальной скорости',
      color: 'text-purple-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Безопасность',
      description: 'Надежная аутентификация и шифрование всех данных',
      color: 'text-blue-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Аналитика',
      description: 'Детальная статистика использования и отслеживание расходов',
      color: 'text-cyan-500'
    }
  ];

  const apiLimits = [
    {
      icon: ClockIcon,
      title: 'Лимиты запросов',
      description: 'Гибкие ограничения по количеству запросов в минуту и день',
      features: ['5-60 запросов/мин', 'До 2000 запросов/день', 'Автоматическое восстановление']
    },
    {
      icon: BoltIcon,
      title: 'Токены',
      description: 'Контроль использования токенов для оптимизации расходов',
      features: ['10K-200K токенов/мин', 'До 5M токенов/день', 'Детальная статистика']
    },
    {
      icon: GlobeAltIcon,
      title: 'Модели',
      description: 'Доступ к различным моделям в зависимости от уровня доступа',
      features: ['Базовые модели бесплатно', 'Премиум модели по подписке', 'Корпоративные решения']
    }
  ];

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
    <div className="page-container bg-anthropic-pattern">
      {/* Hero секция */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative content-wrapper">
          <motion.div
            className="text-center py-12 md:py-20 lg:py-32"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              className="flex justify-center mb-6 md:mb-8"
              variants={itemVariants}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 px-4"
              variants={itemVariants}
            >
              Будущее AI
              <span className="block gradient-text">в одном месте</span>
            </motion.h1>
            
            <motion.p
              className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
              variants={itemVariants}
            >
              OneAI Hub объединяет лучшие AI модели от ведущих компаний в единый API. 
              Создавайте, экспериментируйте и масштабируйте ваши AI-решения без ограничений.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
              variants={itemVariants}
            >
              <Link to="/register" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 flex items-center w-full sm:w-auto justify-center">
                Начать бесплатно
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Link>
              <Link to="/docs" className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto text-center">
                Документация API
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Компании */}
      <section className="content-wrapper">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="responsive-text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Доверенные партнеры
          </h2>
          <p className="responsive-text-lg text-gray-600">
            Мы интегрируем лучшие AI модели от ведущих компаний
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingSpinner text="Загрузка компаний..." />
        ) : (
          <motion.div
            className="card-grid mb-8 md:mb-12"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {companies.slice(0, 8).map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                index={index}
              />
            ))}
          </motion.div>
        )}

        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link to="/companies" className="btn-ghost flex items-center justify-center max-w-xs mx-auto">
            Смотреть все компании
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* Функции */}
      <section className="content-wrapper">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="responsive-text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Почему выбирают нас
          </h2>
          <p className="responsive-text-lg text-gray-600">
            Мощные функции для создания следующего поколения AI приложений
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="glass-card p-4 md:p-6 card-hover"
                variants={itemVariants}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center mb-3 md:mb-4`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${feature.color}`} />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2 responsive-text-base">{feature.title}</h3>
                <p className="text-gray-600 responsive-text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* API Лимиты */}
      <section className="content-wrapper">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="responsive-text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Гибкие лимиты API
          </h2>
          <p className="responsive-text-lg text-gray-600">
            Настраиваемые ограничения для контроля использования и расходов
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
        >
          {apiLimits.map((limit, index) => {
            const Icon = limit.icon;
            return (
              <motion.div
                key={index}
                className="glass-card p-6 md:p-8 card-hover text-center"
                variants={itemVariants}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="responsive-text-xl font-bold text-gray-900 mb-2 md:mb-3">{limit.title}</h3>
                <p className="text-gray-600 responsive-text-sm mb-4 md:mb-6">{limit.description}</p>
                
                <ul className="space-y-2 md:space-y-3">
                  {limit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center responsive-text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA секция */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative content-wrapper">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Готовы начать?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам разработчиков, которые уже используют OneAI Hub 
              для создания революционных AI приложений.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Создать аккаунт
              </Link>
              <Link to="/models" className="btn-secondary text-lg px-8 py-4">
                Изучить модели
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 