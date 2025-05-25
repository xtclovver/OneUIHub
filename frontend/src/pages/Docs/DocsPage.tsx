import React from 'react';
import { FileText, Code, Book, ExternalLink } from 'lucide-react';

const DocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Документация</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Полное руководство по использованию OneAI Hub API и интеграции с различными AI моделями
          </p>
        </div>

        {/* Быстрый старт */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Быстрый старт</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Начните работу с OneAI Hub за несколько минут
            </p>
            <a href="#quick-start" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Читать руководство
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Code className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">API Reference</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Подробная документация по всем API эндпоинтам
            </p>
            <a href="#api-reference" className="text-green-600 hover:text-green-700 font-medium flex items-center">
              Изучить API
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Примеры кода</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Готовые примеры интеграции на разных языках
            </p>
            <a href="#examples" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
              Посмотреть примеры
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <h2 id="quick-start" className="text-2xl font-bold text-gray-900 mb-4">Быстрый старт</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Регистрация и получение API ключа</h3>
            <p className="text-gray-600 mb-4">
              Зарегистрируйтесь в системе и создайте API ключ в разделе "Профиль" → "API ключи".
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Первый запрос</h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800">
{`curl -X POST https://api.oneaihub.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Привет! Как дела?"
      }
    ]
  }'`}
              </pre>
            </div>

            <h2 id="api-reference" className="text-2xl font-bold text-gray-900 mb-4 mt-8">API Reference</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Аутентификация</h3>
            <p className="text-gray-600 mb-4">
              Все запросы к API должны содержать заголовок Authorization с вашим API ключом:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <code className="text-sm text-gray-800">Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Эндпоинты</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">POST /v1/chat/completions</h4>
                <p className="text-gray-600 mb-2">Создание чат-завершения с использованием указанной модели.</p>
                <div className="text-sm text-gray-500">
                  <strong>Параметры:</strong> model, messages, temperature, max_tokens
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">GET /v1/models</h4>
                <p className="text-gray-600 mb-2">Получение списка доступных моделей.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">GET /v1/usage</h4>
                <p className="text-gray-600 mb-2">Получение информации об использовании API.</p>
              </div>
            </div>

            <h2 id="examples" className="text-2xl font-bold text-gray-900 mb-4 mt-8">Примеры кода</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Python</h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800">
{`import requests

url = "https://api.oneaihub.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "gpt-4",
    "messages": [
        {"role": "user", "content": "Привет!"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">JavaScript</h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800">
{`const response = await fetch('https://api.oneaihub.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Привет!' }
    ]
  })
});

const data = await response.json();
console.log(data);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage; 