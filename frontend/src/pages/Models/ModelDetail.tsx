import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  fetchModelById, 
  fetchModelConfig, 
  fetchRateLimits, 
  ModelState, 
  Model, 
  RateLimit 
} from '../../redux/slices/modelSlice';

const ModelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { selectedModel, modelConfig, rateLimits, loading, error } = 
    useSelector((state: RootState) => state.models as ModelState);

  useEffect(() => {
    if (id) {
      dispatch(fetchModelById(id));
      dispatch(fetchModelConfig(id));
      dispatch(fetchRateLimits(id));
    }
  }, [dispatch, id]);

  if (loading) {
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

  if (!selectedModel) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Модель не найдена</h2>
        <p className="text-gray-300 mb-6">Запрошенная модель не существует или была удалена.</p>
        <Link to="/models" className="btn gradient-primary">
          К списку моделей
        </Link>
      </div>
    );
  }

  // Dummy content for preview - remove in production
  const dummyRateLimits = [
    { id: '1', tierId: 'free', tierName: 'Free', requestsPerMinute: 5, requestsPerDay: 100, tokensPerMinute: 10000, tokensPerDay: 100000 },
    { id: '2', tierId: 'starter', tierName: 'Starter', requestsPerMinute: 10, requestsPerDay: 300, tokensPerMinute: 20000, tokensPerDay: 300000 },
    { id: '3', tierId: 'pro', tierName: 'Pro', requestsPerMinute: 30, requestsPerDay: 1000, tokensPerMinute: 100000, tokensPerDay: 1000000 },
    { id: '4', tierId: 'enterprise', tierName: 'Enterprise', requestsPerMinute: 60, requestsPerDay: 2000, tokensPerMinute: 200000, tokensPerDay: 5000000 },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Go back */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-300 hover:text-primary-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Назад к списку
        </button>
      </div>

      {/* Model Hero */}
      <section className="py-12 rounded-xl glass-card">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">{selectedModel.name}</h1>
          
          {selectedModel.features && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedModel.features.split(',').map((feature: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-primary-900/30 text-primary-300 px-3 py-1 rounded-full border border-primary-700/50"
                >
                  {feature.trim()}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-300 text-lg">{selectedModel.description}</p>

          {modelConfig && (
            <div className="grid grid-cols-2 gap-8 mt-6 w-full max-w-2xl bg-gray-800/50 p-6 rounded-lg">
              <div>
                <p className="text-gray-400 text-sm">Стоимость входного токена</p>
                <p className="text-2xl font-semibold text-white">
                  ${modelConfig.inputTokenCost.toFixed(6)} <span className="text-sm text-gray-400">/ токен</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Стоимость выходного токена</p>
                <p className="text-2xl font-semibold text-white">
                  ${modelConfig.outputTokenCost.toFixed(6)} <span className="text-sm text-gray-400">/ токен</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Rate Limits */}
      <section className="py-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Лимиты по тарифам</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="py-4 px-6 rounded-tl-lg">Тариф</th>
                <th className="py-4 px-6">Запросов/мин</th>
                <th className="py-4 px-6">Запросов/день</th>
                <th className="py-4 px-6">Токенов/мин</th>
                <th className="py-4 px-6 rounded-tr-lg">Токенов/день</th>
              </tr>
            </thead>
            <tbody>
              {/* Use actual rateLimits if available, otherwise use dummy data for preview */}
              {(rateLimits.length > 0 ? rateLimits : dummyRateLimits).map((limit: any, index: number) => (
                <tr 
                  key={limit.id || index} 
                  className={`${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'} border-t border-gray-700`}
                >
                  <td className="py-4 px-6 font-semibold">
                    {limit.tierName || `Тариф ${index + 1}`}
                  </td>
                  <td className="py-4 px-6">{limit.requestsPerMinute}</td>
                  <td className="py-4 px-6">{limit.requestsPerDay}</td>
                  <td className="py-4 px-6">{limit.tokensPerMinute.toLocaleString()}</td>
                  <td className="py-4 px-6">{limit.tokensPerDay.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* API Integration */}
      <section className="py-10 card">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Интеграция с API</h2>
        
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <pre className="text-gray-300 overflow-x-auto">
            <code>{`curl -X POST https://api.oneaihub.com/v1/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel.name}",
    "prompt": "Привет, мир!",
    "max_tokens": 100
  }'`}</code>
          </pre>
        </div>
        
        <div className="flex gap-4">
          <Link 
            to="/docs" 
            className="btn gradient-primary"
          >
            Подробная документация
          </Link>
          
          <Link 
            to="/register" 
            className="btn bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white"
          >
            Получить API ключ
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ModelDetailPage; 