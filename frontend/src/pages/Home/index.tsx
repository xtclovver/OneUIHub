import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchCompanies, Company, CompanyState } from '../../redux/slices/companySlice';

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, loading, error } = useSelector((state: RootState) => state.companies as CompanyState);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero section */}
      <section className="text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-radial from-secondary-800/40 to-transparent"></div>
          <div className="h-full w-full" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236D28D9' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Доступ к лучшим ИИ-моделям в одном месте
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            OneAI Hub предоставляет унифицированный API для работы с множеством ИИ-моделей.
            Управляйте доступом, отслеживайте потребление и оптимизируйте расходы в одном интерфейсе.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="btn gradient-primary px-6 py-3 text-lg"
            >
              Начать бесплатно
            </Link>
            <Link 
              to="/models" 
              className="btn bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-6 py-3 text-lg"
            >
              Просмотреть модели
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 glass-card mx-4 md:mx-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Возможности OneAI Hub</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Наша платформа предлагает множество функций для эффективной работы с ИИ-моделями
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card hover:border-primary-500 transition-colors duration-300">
            <div className="text-primary-400 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Единый API</h3>
            <p className="text-gray-300">
              Интегрируйтесь один раз и получите доступ ко множеству моделей через унифицированный интерфейс.
            </p>
          </div>

          <div className="card hover:border-secondary-500 transition-colors duration-300">
            <div className="text-secondary-400 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Управление расходами</h3>
            <p className="text-gray-300">
              Отслеживайте использование токенов и стоимость каждого запроса в реальном времени.
            </p>
          </div>

          <div className="card hover:border-primary-500 transition-colors duration-300">
            <div className="text-primary-400 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Ограничения доступа</h3>
            <p className="text-gray-300">
              Настраивайте лимиты запросов и токенов для каждой модели и тира подписки.
            </p>
          </div>
        </div>
      </section>

      {/* Companies section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Доступные провайдеры</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            OneAI Hub предоставляет доступ к моделям от ведущих ИИ-компаний
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: Company) => (
              <Link 
                key={company.id} 
                to={`/companies/${company.id}`}
                className={`card company-pattern ${company.name.toLowerCase().includes('anthropic') ? 'anthropic-pattern' : company.name.toLowerCase().includes('openai') ? 'openai-pattern' : company.name.toLowerCase().includes('mistral') ? 'mistral-pattern' : ''} hover:shadow-xl hover:shadow-primary-900/20 transition-all duration-300`}
              >
                <div className="flex items-center space-x-4 relative z-10">
                  {company.logoURL ? (
                    <img 
                      src={company.logoURL} 
                      alt={company.name} 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-300">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                    <p className="text-gray-300 line-clamp-2">
                      {company.description || 'Нажмите, чтобы увидеть доступные модели'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA section */}
      <section className="py-16 gradient-primary rounded-lg text-center mx-4 md:mx-8">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Готовы начать?</h2>
          <p className="mb-8 max-w-2xl mx-auto text-white/90">
            Зарегистрируйтесь бесплатно и начните использовать множество ИИ-моделей через единый API.
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 text-lg">
            Создать аккаунт
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 