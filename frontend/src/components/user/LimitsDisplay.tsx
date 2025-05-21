import React from 'react';

interface UserLimits {
  monthlyTokenLimit: number;
  balance: number;
  tierName: string;
}

interface LimitsDisplayProps {
  loading: boolean;
  limits: UserLimits | null;
}

const LimitsDisplay: React.FC<LimitsDisplayProps> = ({ loading, limits }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!limits) {
    return (
      <div className="text-center py-6 text-gray-500">
        Не удалось загрузить информацию о лимитах
      </div>
    );
  }

  // Расчет процента использования токенов
  const usedTokens = 250000; // Для примера. В реальном приложении нужно получить из API
  const totalTokens = limits.monthlyTokenLimit;
  const percentUsed = Math.min(100, Math.floor((usedTokens / totalTokens) * 100));

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-3 gradient-text">Баланс</h3>
          <p className="text-3xl font-bold">${limits.balance.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">Текущий баланс вашего аккаунта</p>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-3 gradient-text">Тариф</h3>
          <p className="text-3xl font-bold">{limits.tierName}</p>
          <p className="text-sm text-gray-400 mt-1">Текущий тарифный план</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-5 gradient-text">Использование токенов</h3>
        
        <div className="mb-2 flex justify-between">
          <span className="text-gray-300">{usedTokens.toLocaleString()} / {totalTokens.toLocaleString()}</span>
          <span className="text-gray-300">{percentUsed}%</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${percentUsed > 75 ? 'bg-red-500' : percentUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-400 mt-3">
          Месячный лимит токенов. Сбрасывается 1-го числа каждого месяца.
        </p>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-5 gradient-text">История использования</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left">Дата</th>
                <th className="px-4 py-3 text-left">Модель</th>
                <th className="px-4 py-3 text-left">Токены</th>
                <th className="px-4 py-3 text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {/* Примеры данных, в реальном приложении нужно получить из API */}
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 text-gray-300">2023-09-15</td>
                <td className="px-4 py-3 text-gray-300">GPT-4</td>
                <td className="px-4 py-3 text-gray-300">10,423</td>
                <td className="px-4 py-3 text-right text-gray-300">$0.25</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 text-gray-300">2023-09-14</td>
                <td className="px-4 py-3 text-gray-300">Claude 3 Opus</td>
                <td className="px-4 py-3 text-gray-300">32,156</td>
                <td className="px-4 py-3 text-right text-gray-300">$0.87</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-300">2023-09-12</td>
                <td className="px-4 py-3 text-gray-300">Mistral Medium</td>
                <td className="px-4 py-3 text-gray-300">15,789</td>
                <td className="px-4 py-3 text-right text-gray-300">$0.19</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LimitsDisplay; 