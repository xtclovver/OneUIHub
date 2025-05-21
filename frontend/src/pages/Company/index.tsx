import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchCompanyById, CompanyState } from '../../redux/slices/companySlice';
import { fetchModelsByCompany, Model, ModelState } from '../../redux/slices/modelSlice';

const CompanyPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedCompany, loading: companyLoading, error: companyError } = 
    useSelector((state: RootState) => state.companies as CompanyState);
  
  const { models, loading: modelsLoading, error: modelsError } = 
    useSelector((state: RootState) => state.models as ModelState);

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id));
      dispatch(fetchModelsByCompany(id));
    }
  }, [dispatch, id]);

  const isLoading = companyLoading || modelsLoading;
  const error = companyError || modelsError;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Компания не найдена</h2>
        <p className="text-gray-300 mb-6">Запрошенная компания не существует или была удалена.</p>
        <Link to="/" className="btn gradient-primary">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Company Hero */}
      <section className={`py-12 rounded-xl glass-card company-pattern ${selectedCompany.name.toLowerCase().includes('anthropic') ? 'anthropic-pattern' : selectedCompany.name.toLowerCase().includes('openai') ? 'openai-pattern' : selectedCompany.name.toLowerCase().includes('mistral') ? 'mistral-pattern' : ''}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
          {selectedCompany.logoURL ? (
            <img 
              src={selectedCompany.logoURL} 
              alt={selectedCompany.name} 
              className="w-32 h-32 object-contain bg-gray-800 rounded-lg p-2"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-300">
                {selectedCompany.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">{selectedCompany.name}</h1>
            {selectedCompany.description && (
              <p className="text-gray-300 mb-6">{selectedCompany.description}</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Models List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Доступные модели</h2>
          <div className="flex gap-4">
            <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">Все возможности</option>
              <option value="text">Текстовые</option>
              <option value="vision">Мультимодальные</option>
              <option value="embedding">Эмбеддинги</option>
            </select>
            <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">Сортировка</option>
              <option value="az">А-Я</option>
              <option value="za">Я-А</option>
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
          </div>
        </div>
        
        {models && models.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model: Model) => (
              <Link 
                key={model.id} 
                to={`/models/${model.id}`}
                className="card hover:border-primary-500 transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-2 text-white">{model.name}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {model.features?.split(',').map((feature: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                      {feature.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 line-clamp-3">
                  {model.description || 'Нажмите, чтобы увидеть подробную информацию о модели'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 card">
            <p className="text-gray-300">Для этой компании пока нет доступных моделей.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CompanyPage; 