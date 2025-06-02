/**
 * Форматирует значение лимита для отображения
 * @param value Значение лимита
 * @returns Строковое представление (число, ∞, или пустая строка)
 */
export const formatLimitValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) return '∞';
  if (value === -1) return '∞';
  return value.toLocaleString();
};

/**
 * Форматирует значение лимита для редактирования в форме
 * @param value Значение лимита
 * @returns Строковое представление для input поля
 */
export const formatLimitEditValue = (value: number): string => {
  if (value === -1) return '∞';
  if (value === 0) return '';
  return value.toString();
};

/**
 * Парсит введенное пользователем значение лимита
 * @param value Строковое значение из input
 * @returns Числовое значение для сохранения
 */
export const parseLimitValue = (value: string): number => {
  // Пустая строка = 0 (без лимита)
  if (!value || value.trim() === '') return 0;
  
  // Бесконечность
  if (value === '∞' || value === '-1') return -1;
  
  // Парсим число
  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : Math.max(0, num);
};

/**
 * Форматирует валютное значение
 * @param value Числовое значение
 * @returns Форматированная строка с валютой
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 6,
  }).format(value);
};

/**
 * Форматирует стоимость токена для отображения (за 1 миллион токенов)
 * @param costPerToken Стоимость за 1 токен
 * @returns Форматированная строка с валютой за миллион токенов
 */
export const formatTokenCost = (costPerToken: number): string => {
  const costPerMillion = costPerToken * 1000000;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(costPerMillion);
};

/**
 * Конвертирует стоимость за 1 токен в стоимость за 1 миллион токенов для отображения в форме
 * @param costPerToken Стоимость за 1 токен
 * @returns Числовое значение стоимости за миллион токенов
 */
export const tokenCostToMillionCost = (costPerToken: number): number => {
  return costPerToken * 1000000;
};

/**
 * Конвертирует стоимость за 1 миллион токенов в стоимость за 1 токен для сохранения
 * @param costPerMillion Стоимость за миллион токенов
 * @returns Числовое значение стоимости за 1 токен
 */
export const millionCostToTokenCost = (costPerMillion: number): number => {
  return costPerMillion / 1000000;
};

/**
 * Форматирует большие числа с разделителями тысяч
 * @param value Числовое значение
 * @returns Форматированная строка
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
}; 