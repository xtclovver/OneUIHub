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
  if (value === '' || value === '0') return 0;
  if (value === '∞' || value === '-1') return -1;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
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
 * Форматирует большие числа с разделителями тысяч
 * @param value Числовое значение
 * @returns Форматированная строка
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
}; 