import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-gray-800 bg-opacity-60 backdrop-blur-md z-50 sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold gradient-text">
              OneAI Hub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-200 hover:text-primary-400 transition-colors">
              Главная
            </Link>
            <Link to="/models" className="text-gray-200 hover:text-primary-400 transition-colors">
              Модели
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/requests" className="text-gray-200 hover:text-primary-400 transition-colors">
                  Запросы
                </Link>
                <Link to="/profile" className="text-gray-200 hover:text-primary-400 transition-colors">
                  Профиль
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-200 hover:text-primary-400 transition-colors"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-200 hover:text-primary-400 transition-colors">
                  Вход
                </Link>
                <Link to="/register" className="btn gradient-primary text-white">
                  Регистрация
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col space-y-4 bg-gray-800 rounded-md p-4 mb-4">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-primary-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/models" 
              className="text-gray-200 hover:text-primary-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Модели
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/requests" 
                  className="text-gray-200 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Запросы
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-200 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="text-gray-200 hover:text-primary-400 transition-colors text-left"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-200 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="btn gradient-primary w-full text-center text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 