import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useExchangeRateStore } from '../store/exchangeRateStore';

interface ExchangeRatesContextType {
  bcvRate: number;
  usdtRate: number;
  averageRate: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  lastUpdated: number | null;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextType | undefined>(undefined);

export function ExchangeRatesProvider({ children }: { children: ReactNode }) {
  const store = useExchangeRateStore();

  const averageRate = useMemo(() => {
    if (!store.rates) return 0;
    return (store.rates.bcv + store.rates.usdt) / 2;
  }, [store.rates]);

  const value = useMemo(
    () => ({
      bcvRate: store.rates?.bcv ?? 0,
      usdtRate: store.rates?.usdt ?? 0,
      averageRate,
      isLoading: store.isLoading,
      isRefreshing: store.isRefreshing,
      error: store.error,
      refreshRates: store.refreshRates,
      lastUpdated: store.rates?.timestamp ?? null,
    }),
    [store, averageRate],
  );

  return <ExchangeRatesContext.Provider value={value}>{children}</ExchangeRatesContext.Provider>;
}

export function useExchangeRatesContext() {
  const context = useContext(ExchangeRatesContext);
  if (context === undefined) {
    throw new Error('useExchangeRatesContext must be used within an ExchangeRatesProvider');
  }
  return context;
}
