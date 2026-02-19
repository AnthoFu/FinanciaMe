import { useExchangeRatesContext } from '../context/ExchangeRatesContext';

export const useExchangeRates = () => {
  const { bcvRate, usdtRate, averageRate, isLoading, error, refreshRates, isRefreshing, lastUpdated } =
    useExchangeRatesContext();

  return {
    bcvRate,
    usdtRate,
    averageRate,
    loading: isLoading,
    error,
    refreshRates,
    isRefreshing,
    lastUpdated,
  };
};
