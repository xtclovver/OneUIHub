import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchModels, Model, ModelState } from '../../redux/slices/modelSlice';

const ModelsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { models, loading, error } = useSelector((state: RootState) => state.models as ModelState);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const filteredModels = models.filter((model: Model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFeature = selectedFeature ? 
      (model.features && model.features.toLowerCase().includes(selectedFeature.toLowerCase())) : 
      true;
    
    return matchesSearch && matchesFeature;
  });

  const sortedModels = [...filteredModels].sort((a: Model, b: Model) => {
    switch (sortOption) {
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="py-10 rounded-xl glass-card mb-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">ИИ-модели</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Выберите модель из нашего каталога для вашего проекта. Все доступные модели объединены единым API.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Поиск моделей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
            >
              <option value="">Все возможности</option>
              <option value="text">Текстовые</option>
              <option value="vision">Мультимодальные</option>
              <option value="embedding">Эмбеддинги</option>
              <option value="fine-tuning">Тонкая настройка</option>
            </select>
            
            <select 
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Сортировка</option>
              <option value="az">А-Я</option>
              <option value="za">Я-А</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
            <p>{error}</p>
          </div>
        ) : sortedModels.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModels.map((model: Model) => (
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
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                    >
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
            <p className="text-gray-300">
              {searchTerm || selectedFeature 
                ? 'Моделей, соответствующих вашему запросу, не найдено' 
                : 'Список моделей пуст'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ModelsPage; 