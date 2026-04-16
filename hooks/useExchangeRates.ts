import { useExchangeRatesContext } from '../context/ExchangeRatesContext';

export const useExchangeRates = () => {
  const { bcvRate, usdtRate, eurRate, averageRate, isLoading, error, refreshRates, isRefreshing, lastUpdated } =
    useExchangeRatesContext();

  return {
    bcvRate,
    usdtRate,
    eurRate,
    averageRate,
    loading: isLoading,
    error,
    refreshRates,
    isRefreshing,
    lastUpdated,
  };
};
