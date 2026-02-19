import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXCHANGE_RATES_KEY } from '../constants/StorageKeys';

interface ExchangeRates {
  bcv: number;
  usdt: number;
  timestamp: number;
}

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

const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora
const FETCH_TIMEOUT_MS = 10000; // 10 segundos para no bloquear la app si hay internet lento

export function ExchangeRatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatesFromApi = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const [bcvResponse, paraleloResponse] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial', { signal: controller.signal }),
        fetch('https://ve.dolarapi.com/v1/dolares/paralelo', { signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      if (!bcvResponse.ok || !paraleloResponse.ok) {
        throw new Error('No se pudieron obtener las tasas de cambio de ve.dolarapi.com');
      }

      const bcvData = await bcvResponse.json();
      const paraleloData = await paraleloResponse.json();

      if (typeof bcvData.promedio !== 'number' || typeof paraleloData.promedio !== 'number') {
        throw new Error('La estructura de la respuesta de la API es inesperada');
      }

      const newRates: ExchangeRates = {
        bcv: bcvData.promedio,
        usdt: paraleloData.promedio,
        timestamp: Date.now(),
      };

      setRates(newRates);
      setError(null);
      await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(newRates));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Tiempo de espera de conexión agotado. Usando tasas guardadas.');
      } else {
        setError(err.message || 'Error al actualizar tasas de cambio');
      }
      console.warn('[ExchangeRatesContext] Error fetching rates:', err);
    }
  }, []);

  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    await fetchRatesFromApi();
    setIsRefreshing(false);
  }, [fetchRatesFromApi]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Cargar inmediatamente desde caché para que la app responda offline
      const cachedRates = await AsyncStorage.getItem(EXCHANGE_RATES_KEY);
      let existingData: ExchangeRates | null = null;

      if (cachedRates) {
        existingData = JSON.parse(cachedRates);
        setRates(existingData);
      }

      // 2. Si no hay datos o son viejos, intentar actualizar desde la API
      const now = Date.now();
      const isStale = !existingData || (now - existingData.timestamp > CACHE_EXPIRATION_MS);

      if (isStale) {
        await fetchRatesFromApi();
      }
    } catch (e) {
      console.error('[ExchangeRatesContext] Error loading initial data:', e);
      setError('Error al cargar datos iniciales');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRatesFromApi]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const averageRate = useMemo(() => {
    if (!rates) return 0;
    return (rates.bcv + rates.usdt) / 2;
  }, [rates]);

  const value = useMemo(
    () => ({
      bcvRate: rates?.bcv ?? 0,
      usdtRate: rates?.usdt ?? 0,
      averageRate,
      isLoading,
      isRefreshing,
      error,
      refreshRates,
      lastUpdated: rates?.timestamp ?? null,
    }),
    [rates, averageRate, isLoading, isRefreshing, error, refreshRates]
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
