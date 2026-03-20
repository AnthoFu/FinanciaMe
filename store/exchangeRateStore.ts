import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXCHANGE_RATES_KEY } from '../constants/StorageKeys';

interface ExchangeRates {
  bcv: number;
  usdt: number;
  timestamp: number;
}

interface ExchangeRateState {
  rates: ExchangeRates | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchRatesFromApi: () => Promise<void>;
  refreshRates: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora
const FETCH_TIMEOUT_MS = 10000; // 10 segundos

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: null,
      isLoading: true,
      isRefreshing: false,
      error: null,

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchRatesFromApi: async () => {
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

          set({ rates: newRates, error: null });
        } catch (err: any) {
          if (err.name === 'AbortError') {
            set({ error: 'Tiempo de espera de conexión agotado. Usando tasas guardadas.' });
          } else {
            set({ error: err.message || 'Error al actualizar tasas de cambio' });
          }
          console.warn('[ExchangeRateStore] Error fetching rates:', err);
        }
      },

      refreshRates: async () => {
        set({ isRefreshing: true });
        await get().fetchRatesFromApi();
        set({ isRefreshing: false });
      },
    }),
    {
      name: EXCHANGE_RATES_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const checkInitialData = async () => {
            const now = Date.now();
            const currentRates = state.rates;
            const isStale = !currentRates || now - currentRates.timestamp > CACHE_EXPIRATION_MS;

            if (isStale) {
              await state.fetchRatesFromApi();
            }
            state.setIsLoading(false);
          };
          checkInitialData();
        }
      },
    },
  ),
);
