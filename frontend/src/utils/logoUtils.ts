/**
 * Утилиты для работы с логотипами компаний
 */

/**
 * Преобразует относительные URL логотипов в полные
 * @param logoUrl - URL логотипа (может быть относительным или полным)
 * @returns Полный URL логотипа или undefined если logoUrl не задан
 */
export const getFullLogoUrl = (logoUrl: string | undefined): string | undefined => {
  if (!logoUrl) return undefined;
  
  // Если это уже полный URL, возвращаем как есть
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  
  // Если это путь к загруженному файлу
  if (logoUrl.startsWith('/uploads/')) {
    return `http://localhost:8080${logoUrl}`;
  }
  
  // Если это относительный путь без начального слеша
  if (logoUrl.startsWith('uploads/')) {
    return `http://localhost:8080/${logoUrl}`;
  }
  
  // В остальных случаях добавляем базовый URL
  return `http://localhost:8080${logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl}`;
};

/**
 * Обработчик ошибок загрузки логотипа
 * Скрывает изображение и показывает fallback элемент если он есть
 * @param event - событие ошибки загрузки изображения
 * @param logoUrl - URL логотипа для отладки
 */
export const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>, logoUrl?: string) => {
  const target = event.currentTarget;
  
  // Логируем ошибку для отладки
  if (logoUrl) {
    console.error('Ошибка загрузки логотипа:', logoUrl);
  }
  
  // Скрываем изображение
  target.style.display = 'none';
  
  // Показываем fallback элемент если он есть
  const fallbackElement = target.nextElementSibling as HTMLElement;
  if (fallbackElement && fallbackElement.style.display === 'none') {
    fallbackElement.style.display = 'flex';
  }
}; 