const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Прокси для статических файлов загрузок (логотипы компаний)
  // Должен быть ПЕРВЫМ, чтобы перехватывать запросы до API прокси
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Прокси запрос для uploads:', req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Ответ прокси для uploads:', proxyRes.statusCode, req.url);
      }
    })
  );
  
  // Прокси для API запросов
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
}; 