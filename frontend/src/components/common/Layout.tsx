import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CpuChipIcon, 
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Главная', href: '/', icon: HomeIcon },
    { name: 'Компании', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Модели', href: '/models', icon: CpuChipIcon },
    { name: 'Документация', href: '/docs', icon: DocumentTextIcon },
  ];

  const userNavigation = [
    { name: 'Профиль', href: '/profile', icon: UserIcon },
    { name: 'Запросы', href: '/requests', icon: ClockIcon },
  ];

  const adminNavigation = [
    { name: 'Админ-панель', href: '/admin', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="page-container bg-anthropic-pattern">
      {/* Навигационная панель */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Логотип */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">OneAI Hub</span>
            </Link>

            {/* Основная навигация */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Пользовательское меню */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Пользовательская навигация - показывается только для авторизованных */}
                  <div className="hidden md:flex items-center space-x-4">
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                            isActive
                              ? 'text-orange-600 bg-orange-50'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Админ навигация */}
                  {user?.role === 'admin' && (
                    <div className="hidden md:flex items-center space-x-4">
                      {adminNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                              isActive
                                ? 'text-orange-600 bg-orange-50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Кнопка выхода */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Выход</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="btn-ghost text-base"
                  >
                    Вход
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-base"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Футер */}
      <footer className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">OneAI Hub</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Унифицированный хаб для доступа к множественным AI моделям через единый API. 
                Простая интеграция, прозрачная тарификация, мощные возможности.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 font-medium mb-4">Навигация</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-medium mb-4">Поддержка</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm">
                    Документация API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm">
                    Техподдержка
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-sm">
                    Примеры кода
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2024 OneAI Hub. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 