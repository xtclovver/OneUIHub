import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchRequests } from '../../redux/slices/requestsSlice';

const RequestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error } = useSelector((state: RootState) => state.requests);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  // Функция для форматирования стоимости
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Компонент для отображения стоимости с декомпозицией или без
  const CostDisplay = ({ inputCost, outputCost, totalCost }: { inputCost: number, outputCost: number, totalCost: number }) => {
    if (showCostBreakdown) {
      return (
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Ввод: {formatCost(inputCost)}</p>
          <p className="text-sm text-gray-400">Вывод: {formatCost(outputCost)}</p>
          <p className="font-medium">Итого: {formatCost(totalCost)}</p>
        </div>
      );
    }
    return <p>{formatCost(totalCost)}</p>;
  };

  // Временные данные для демонстрации, если запросы еще не загружены
  const demoRequests = [
    {
      id: '1',
      created_at: new Date().toISOString(),
      model: { id: '1', name: 'GPT-4' },
      input_tokens: 1256,
      output_tokens: 748,
      input_cost: 0.000315,
      output_cost: 0.000674,
      total_cost: 0.000989
    },
    {
      id: '2',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      model: { id: '2', name: 'Claude 3.5 Sonnet' },
      input_tokens: 3450,
      output_tokens: 1290,
      input_cost: 0.000863,
      output_cost: 0.001935,
      total_cost: 0.002798
    },
    {
      id: '3',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      model: { id: '3', name: 'Mistral Medium' },
      input_tokens: 890,
      output_tokens: 566,
      input_cost: 0.000223,
      output_cost: 0.000425,
      total_cost: 0.000648
    }
  ];

  // Используем демо-данные, если запросы еще не загружены
  const displayRequests = requests.length > 0 ? requests : demoRequests;
  
  // Рассчитываем, какие запросы показывать на текущей странице
  const paginatedRequests = displayRequests.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(displayRequests.length / rowsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="py-10 rounded-xl glass-card">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">История запросов</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Отслеживайте использование моделей и стоимость запросов.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-end">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={showCostBreakdown}
              onChange={() => setShowCostBreakdown(!showCostBreakdown)}
            />
            <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            <span className="ml-3 text-gray-300">Показать разбивку стоимости</span>
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Модель</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Входные токены</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Выходные токены</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-primary-700 to-violet-700 text-white">
                          {request.model.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {request.input_tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {request.output_tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        <CostDisplay 
                          inputCost={request.input_cost} 
                          outputCost={request.output_cost} 
                          totalCost={request.total_cost} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleChangePage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  >
                    &laquo;
                  </button>
                  
                  {Array.from({ length: pageCount }).map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handleChangePage(index + 1)}
                      className={`px-3 py-1 rounded-md ${page === index + 1 ? 'bg-primary-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handleChangePage(Math.min(pageCount, page + 1))}
                    disabled={page === pageCount}
                    className={`px-3 py-1 rounded-md ${page === pageCount ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default RequestsPage; 