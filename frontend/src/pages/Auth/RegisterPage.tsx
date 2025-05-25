import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../redux/store';
import { register } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements: PasswordRequirement[] = [
    { text: 'Минимум 8 символов', met: formData.password.length >= 8 },
    { text: 'Содержит заглавную букву', met: /[A-Z]/.test(formData.password) },
    { text: 'Содержит строчную букву', met: /[a-z]/.test(formData.password) },
    { text: 'Содержит цифру', met: /\d/.test(formData.password) },
    { text: 'Пароли совпадают', met: formData.password === formData.confirmPassword && formData.confirmPassword !== '' }
  ];

  const isFormValid = passwordRequirements.every(req => req.met) && 
                     formData.email && formData.firstName && formData.lastName;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await dispatch(register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      }) as any).unwrap();
      navigate('/');
    } catch (error) {
      // Ошибка обрабатывается в slice
    }
  };

  return (
    <div className="page-container bg-anthropic-pattern min-h-screen flex items-center justify-center py-12">
      <div className="absolute inset-0 hero-gradient"></div>
      
      <motion.div
        className="relative w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Создать аккаунт</h1>
            <p className="text-gray-600">Присоединяйтесь к OneAI Hub</p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Иван"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Иванов"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 w-full"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Создайте надежный пароль"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Повторите пароль"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Требования к паролю */}
            {formData.password && (
              <motion.div
                className="bg-gray-50 rounded-lg p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-3">Требования к паролю:</h4>
                <div className="space-y-2">
                  {passwordRequirements.map((requirement, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {requirement.met ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${requirement.met ? 'text-green-600' : 'text-gray-600'}`}>
                        {requirement.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full flex items-center justify-center transition-all duration-300 ${
                isFormValid 
                  ? 'btn-primary' 
                  : 'bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Создать аккаунт
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Дополнительные ссылки */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Уже есть аккаунт?{' '}
              <Link 
                to="/login" 
                className="text-orange-500 hover:text-orange-600 transition-colors duration-300"
              >
                Войти
              </Link>
            </p>
          </div>

          {/* Политика конфиденциальности */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Регистрируясь, вы соглашаетесь с{' '}
              <a href="#" className="text-orange-500 hover:text-orange-600">
                Политикой конфиденциальности
              </a>{' '}
              и{' '}
              <a href="#" className="text-orange-500 hover:text-orange-600">
                Условиями использования
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 