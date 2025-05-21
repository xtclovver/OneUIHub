import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 gradient-text">OneAI Hub</h3>
            <p className="text-gray-300">
              Платформа для доступа к различным моделям искусственного интеллекта через единый интерфейс.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-400">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/models" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Модели
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Вход
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Регистрация
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary-400">Поддержка</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-secondary-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-secondary-400 transition-colors">
                  Документация
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-secondary-400 transition-colors">
                  Связаться с нами
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-400">Подписаться на новости</h4>
            <form className="mt-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email"
                  className="px-3 py-2 rounded-l-md bg-gray-800 text-white w-full focus:outline-none focus:ring-1 focus:ring-primary-500 border border-gray-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 gradient-primary text-white rounded-r-md hover:opacity-90 transition-opacity"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} OneAI Hub. Все права защищены.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Условия использования
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 