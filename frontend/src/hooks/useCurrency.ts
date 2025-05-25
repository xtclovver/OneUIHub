import { useState, useEffect } from 'react';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
}

interface Currency {
  id: string;
  name: string;
  symbol: string;
}

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
      const response = await fetch('/api/currencies');
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data);
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
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

  return {
    exchangeRates,
    currencies,
    loading,
    convertPrice,
    formatPrice,
    getPriceInBothCurrencies
  };
}; 