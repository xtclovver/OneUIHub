import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchCompanies, Company, CompanyState } from '../../redux/slices/companySlice';

// Импорт SVG-файлов
import AnthropicLogo from '../../svg/anthropic-logo.svg';
import OpenAILogo from '../../svg/openai-logo.svg';
import GoogleLogo from '../../svg/google-logo.svg';
import MicrosoftLogo from '../../svg/microsoft-logo.svg';
import MetaLogo from '../../svg/meta-logo.svg';
import DeepseekLogo from '../../svg/deepseek-logo.svg';
import AmazonLogo from '../../svg/amazon-logo.svg'; // Используем имеющийся SVG, потом заменим на Amazon
import NvidiaLogo from '../../svg/nvidia-logo.svg';
import XAILogo from '../../svg/xai-logo.svg';

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, loading, error } = useSelector((state: RootState) => state.companies as CompanyState);
  const [activeCompany, setActiveCompany] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Определение логотипов для карусели
  const logos = [
    { src: AnthropicLogo, name: 'Anthropic', description: 'Создатели Claude - современного ИИ-ассистента с акцентом на безопасность и надежность.' },
    { src: OpenAILogo, name: 'OpenAI', description: 'Разработчики GPT-4, DALL-E 3 и других передовых ИИ-моделей.' },
    { src: GoogleLogo, name: 'Google', description: 'Семейство моделей Gemini для различных задач ИИ.' },
    { src: MicrosoftLogo, name: 'Microsoft', description: 'Платформа Azure OpenAI и другие ИИ-решения для бизнеса.' },
    { src: MetaLogo, name: 'Meta', description: 'Создатели семейства моделей Llama с открытым исходным кодом.' },
    { src: DeepseekLogo, name: 'DeepSeek', description: 'Инновационные модели для кодирования и генерации контента.' },
    { src: AmazonLogo, name: 'Amazon', description: 'Платформа Amazon Bedrock с доступом к ведущим моделям через единый API.' },
    { src: NvidiaLogo, name: 'NVIDIA', description: 'Технологические решения для ускорения ИИ-систем.' },
    { src: XAILogo, name: 'xAI', description: 'Разработчики модели Grok с акцентом на предоставление фактической информации.' },
  ];

  // Закрытие детальной информации о компании с анимацией
  const handleCloseDetails = () => {
    if (activeCompany !== null) {
      // Добавляем класс для анимации скрытия
      const detailElement = document.querySelector('.company-details');
      if (detailElement) {
        detailElement.classList.add('animate-fade-out');
        
        // Через 300мс (длительность анимации) скрываем детали
        setTimeout(() => {
          setActiveCompany(null);
          // Удаляем класс анимации для следующего открытия
          detailElement.classList.remove('animate-fade-out');
        }, 300);
      } else {
        setActiveCompany(null);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // Автоматическая прокрутка карусели
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const scrollWidth = carouselRef.current.scrollWidth;
        const clientWidth = carouselRef.current.clientWidth;
        const scrollLeft = carouselRef.current.scrollLeft;
        
        const halfwayPoint = scrollWidth / 2;
        
        if (scrollLeft + clientWidth >= halfwayPoint && scrollLeft < halfwayPoint) {
          // Плавный переход от середины к началу
          carouselRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Плавно прокрутить карусель дальше
          carouselRef.current.scrollLeft += 1;
        }
      }
    }, 40); // Увеличиваем интервал для уменьшения нагрузки на браузер
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="text-center py-16 md:py-24 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="heading-lg mb-6 gradient-text max-w-4xl mx-auto opacity-0 animate-fade-in-down fira-sans-bold">
            Доступ к лучшим ИИ-моделям в одном месте
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 opacity-0 animate-fade-in-up delay-200 fira-sans-light">
            OneAI Hub предоставляет унифицированный API для работы с множеством ИИ-моделей.
            Управляйте доступом, отслеживайте потребление и оптимизируйте расходы в одном интерфейсе.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-fade-in-up delay-300">
            <Link 
              to="/register" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow fira-sans-medium"
            >
              Начать бесплатно
            </Link>
            <Link 
              to="/models" 
              className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 px-6 py-3 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow fira-sans-medium"
            >
              Просмотреть модели
            </Link>
          </div>
          
          {/* Карусель логотипов компаний */}
          <div className="mt-16 max-w-5xl mx-auto opacity-0 animate-zoom-in delay-500">
            <div 
              ref={carouselRef}
              className="overflow-x-hidden whitespace-nowrap pb-12 px-10"
            >
              <div className="inline-block whitespace-nowrap min-w-full">
                {/* Для плавного перехода добавляем пару логотипов из конца в начало */}
                {logos.slice(-2).map((logo, index) => (
                  <div 
                    key={`prefix-${index}`} 
                    className={`inline-block mx-8 cursor-pointer transition-all duration-300 ${activeCompany === index - 2 + logos.length ? 'scale-125' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setActiveCompany(index - 2 + logos.length)}
                  >
                    <img 
                      src={logo.src} 
                      alt={logo.name}
                      className="h-24 w-24 sm:h-36 sm:w-36 object-contain" 
                    />
                  </div>
                ))}
                
                {/* Основные логотипы */}
                {logos.map((logo, index) => (
                  <div 
                    key={index} 
                    className={`inline-block mx-8 cursor-pointer transition-all duration-300 ${activeCompany === index ? 'scale-125' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setActiveCompany(activeCompany === index ? null : index)}
                  >
                    <img 
                      src={logo.src} 
                      alt={logo.name}
                      className="h-24 w-24 sm:h-36 sm:w-36 object-contain" 
                    />
                  </div>
                ))}
                
                {/* Повторяем логотипы для плавного перехода */}
                {logos.slice(0, 2).map((logo, index) => (
                  <div 
                    key={`suffix-${index}`}
                    className={`inline-block mx-8 cursor-pointer transition-all duration-300 ${activeCompany === index + logos.length ? 'scale-125' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setActiveCompany(index + logos.length)}
                  >
                    <img 
                      src={logo.src}
                      alt={logo.name}
                      className="h-24 w-24 sm:h-36 sm:w-36 object-contain" 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Детали выбранной компании */}
            <div 
              className={`company-details mt-6 transition-all duration-300 
                ${activeCompany !== null 
                  ? 'opacity-100 max-h-80 transform-gpu scale-100' 
                  : 'opacity-0 max-h-0 overflow-hidden transform-gpu scale-95'}`}
            >
              {activeCompany !== null && (
                <div className="text-center p-6 mx-auto max-w-3xl bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-100 shadow-lg relative animate-fade-in">
                  <button 
                    onClick={handleCloseDetails}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 fira-sans-semibold">
                    {logos[activeCompany % logos.length].name}
                  </h3>
                  <p className="text-gray-600 mb-4 fira-sans-regular">
                    {logos[activeCompany % logos.length].description}
                  </p>
                  <Link 
                    to={`/companies/${activeCompany % logos.length + 1}`} 
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:scale-105 fira-sans-medium"
                  >
                    Подробнее о моделях
                  </Link>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center fira-sans-light">
              Нажмите на логотип, чтобы узнать больше о компании
            </p>
          </div>
        </div>

        {/* Фоновый паттерн в стиле Anthropic */}
        <div className="absolute inset-0 -z-10">
          <svg className="absolute right-0 top-0 h-full opacity-20" width="406" height="600" viewBox="0 0 406 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="anthropic-line animate-draw" d="M405 0C405 220.914 226.914 400 5 400" stroke="#E97F5E" strokeWidth="2"/>
            <circle cx="5" cy="400" r="5" fill="#E97F5E" />
            <path className="anthropic-line animate-draw" d="M405 200C405 310.457 310.457 400 200 400" stroke="#E97F5E" strokeWidth="2" />
            <circle cx="200" cy="400" r="5" fill="#E97F5E" />
            <path className="anthropic-line animate-draw" d="M405 100C405 320.914 226.914 500 5 500" stroke="#E97F5E" strokeWidth="2" />
            <circle cx="5" cy="500" r="5" fill="#E97F5E" />
          </svg>
          <svg className="absolute left-0 bottom-0 h-full opacity-20" width="406" height="600" viewBox="0 0 406 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="anthropic-line animate-draw" d="M1 600C1 379.086 179.086 200 401 200" stroke="#E97F5E" strokeWidth="2"/>
            <circle cx="401" cy="200" r="5" fill="#E97F5E" />
            <path className="anthropic-line animate-draw" d="M1 400C1 289.543 95.5431 200 206 200" stroke="#E97F5E" strokeWidth="2" />
            <circle cx="206" cy="200" r="5" fill="#E97F5E" />
            <path className="anthropic-line animate-draw" d="M1 500C1 279.086 179.086 100 401 100" stroke="#E97F5E" strokeWidth="2" />
            <circle cx="401" cy="100" r="5" fill="#E97F5E" />
          </svg>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-neutral-50 rounded-xl mx-4 md:mx-8">
        <div className="text-center mb-12">
          <h2 className="heading-md mb-4 gradient-text opacity-0 animate-fade-in-down fira-sans-semibold">Инновационные возможности OneAI Hub</h2>
          <p className="text-gray-600 max-w-2xl mx-auto opacity-0 animate-fade-in-up delay-100 fira-sans-light">
            Наша платформа объединяет передовые технологии для максимально эффективной работы с искусственным интеллектом
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="card hover:shadow-md opacity-0 animate-fade-in-left delay-200">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 fira-sans-semibold">Унифицированный API</h3>
            <p className="text-gray-600 fira-sans-regular">
              Интегрируйтесь один раз и получите мгновенный доступ ко всем ведущим моделям через единый интерфейс.
            </p>
          </div>

          <div className="card hover:shadow-md opacity-0 animate-fade-in-up delay-300">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"></path>
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 fira-sans-semibold">Интеллектуальное управление расходами</h3>
            <p className="text-gray-600 fira-sans-regular">
              Отслеживайте потребление токенов и автоматизируйте оптимизацию затрат на использование ИИ-моделей.
            </p>
          </div>

          <div className="card hover:shadow-md opacity-0 animate-fade-in-right delay-400">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 fira-sans-semibold">Гибкая система ограничений</h3>
            <p className="text-gray-600 fira-sans-regular">
              Настройте индивидуальные лимиты для каждой модели, обеспечивая прозрачность и предсказуемость бюджета.
            </p>
          </div>
        </div>
      </section>

      {/* Companies section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="heading-md mb-4 gradient-text opacity-0 animate-fade-in-down fira-sans-semibold">Лидирующие ИИ-провайдеры на одной платформе</h2>
          <p className="text-gray-600 max-w-2xl mx-auto opacity-0 animate-fade-in-up delay-100 fira-sans-light">
            OneAI Hub интегрирует модели от ведущих компаний в области искусственного интеллекта
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4 fira-sans-medium">
            {error}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {companies.map((company: Company, index: number) => (
              <Link 
                key={company.id} 
                to={`/companies/${company.id}`}
                className={`card company-pattern ${company.name.toLowerCase().includes('anthropic') ? 'anthropic-pattern' : company.name.toLowerCase().includes('openai') ? 'openai-pattern' : company.name.toLowerCase().includes('mistral') ? 'mistral-pattern' : ''} hover:shadow-xl hover:border-primary-300 transition-all duration-300 opacity-0 animate-zoom-in`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-center space-x-4 relative z-10">
                  {company.logoURL ? (
                    <img 
                      src={company.logoURL} 
                      alt={company.name} 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-700 fira-sans-bold">
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 fira-sans-semibold">{company.name}</h3>
                    <p className="text-gray-600 line-clamp-2 fira-sans-regular">
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
      <section className="py-16 mx-4 md:mx-8 rounded-xl relative overflow-hidden opacity-0 animate-fade-in-up delay-300">
        <div className="anthropic-gradient absolute inset-0 opacity-10 rounded-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-white/70 rounded-xl"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h2 className="heading-md mb-4 text-gray-900 fira-sans-semibold">Начните революцию в работе с ИИ</h2>
          <p className="mb-8 text-lg text-gray-700 max-w-2xl mx-auto fira-sans-light">
            Зарегистрируйтесь бесплатно и откройте для себя новые возможности работы с искусственным интеллектом через единую платформу.
          </p>
          <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-lg hover:scale-105 fira-sans-medium">
            Создать аккаунт
          </Link>
        </div>
        
        {/* Декоративные элементы как у Anthropic */}
        <svg className="absolute -right-24 -bottom-24 h-64 w-64 text-primary-500 opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M196,0 C196,108.16 108.16,196 0,196" stroke="currentColor" strokeWidth="12" />
        </svg>
      </section>
    </div>
  );
};

export default HomePage; 