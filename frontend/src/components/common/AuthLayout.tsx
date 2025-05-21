import { FC } from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Левая колонка - информация о сервисе */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-800 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="text-3xl font-bold">OneAI Hub</Link>
          <div className="mt-12 max-w-lg">
            <h1 className="text-4xl font-bold mb-6">Единый доступ к лучшим моделям ИИ</h1>
            <p className="text-xl mb-8">
              OneAI Hub предоставляет простой и удобный интерфейс для работы с множеством
              AI-моделей через единый API. Управляйте доступом, отслеживайте использование и
              оптимизируйте расходы.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span>Доступ к моделям OpenAI, Anthropic, Mistral и других</span>
              </div>
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span>Детальное отслеживание запросов и расходов</span>
              </div>
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span>Гибкие тарифы с различными лимитами</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} OneAI Hub. Все права защищены.
          </p>
        </div>
      </div>

      {/* Правая колонка - форма аутентификации */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="text-3xl font-bold text-primary-600">OneAI Hub</Link>
            <p className="mt-2 text-gray-600">
              Единый доступ к лучшим моделям ИИ
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 