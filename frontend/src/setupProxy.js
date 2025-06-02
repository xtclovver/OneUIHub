const { createProxyMiddleware } = require('http-proxy-middleware');

// Получаем URL бэкенда из переменных окружения или используем localhost по умолчанию
const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

module.exports = function(app) {
  // Прокси для статических файлов загрузок (логотипы компаний)
  // Должен быть ПЕРВЫМ, чтобы перехватывать запросы до API прокси
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Прокси запрос для uploads:', req.url, 'к', BACKEND_URL);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Ответ прокси для uploads:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('Ошибка прокси для uploads:', err.message);
      }
    })
  );
  
  // Прокси для API запросов
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Прокси запрос для API:', req.url, 'к', BACKEND_URL);
      },
      onError: (err, req, res) => {
        console.error('Ошибка прокси для API:', err.message);
      }
    })
  );
}; 