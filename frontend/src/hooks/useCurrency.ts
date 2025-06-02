import { useState, useEffect } from 'react';
import { ExchangeRate, Currency } from '../types';

export const useCurrency = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
    fetchExchangeRates();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/currencies');
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Используем моковые данные при ошибке
      setCurrencies([
        { id: 'USD', name: 'US Dollar', symbol: '$' },
        { id: 'RUB', name: 'Russian Ruble', symbol: '₽' }
      ]);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/currencies/exchange-rates');
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Используем моковые данные при ошибке
      setExchangeRates([
        { 
          id: 'usd-rub',
          from_currency: 'USD', 
          to_currency: 'RUB', 
          rate: 95.0,
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = exchangeRates.find(
      r => r.from_currency === fromCurrency && r.to_currency === toCurrency
    );
    
    return rate ? amount * rate.rate : amount;
  };

  const formatPrice = (amount: number, currency: string): string => {
    const currencyData = currencies.find(c => c.id === currency);
    const symbol = currencyData?.symbol || currency;
    
    if (currency === 'RUB') {
      return `${amount.toFixed(2)} ${symbol}`;
    }
    
    return `${symbol}${amount.toFixed(4)}`;
  };

  const getPriceInBothCurrencies = (usdPrice: number) => {
    const rubPrice = convertPrice(usdPrice, 'USD', 'RUB');
    return {
      usd: formatPrice(usdPrice, 'USD'),
      rub: formatPrice(rubPrice, 'RUB')
    };
  };

  const updateExchangeRates = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/currencies/update-rates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Обновляем курсы после успешного обновления
        await fetchExchangeRates();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      return false;
    }
  };

  return {
    exchangeRates,
    currencies,
    loading,
    convertPrice,
    formatPrice,
    getPriceInBothCurrencies,
    updateExchangeRates,
    refetch: () => {
      fetchCurrencies();
      fetchExchangeRates();
    }
  };
}; 