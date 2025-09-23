import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { EXCHANGE_RATES_KEY } from '../constants/StorageKeys';

interface ExchangeRates {
  bcv: number;
  usdt: number;
  timestamp: number;
}

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Primero intentar cargar desde caché
        const cachedRates = await AsyncStorage.getItem(EXCHANGE_RATES_KEY);
        let cachedData: ExchangeRates | null = null;

        if (cachedRates) {
          cachedData = JSON.parse(cachedRates);
          // Usar datos en caché si tienen menos de 1 hora de antigüedad
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          if (cachedData && cachedData.timestamp > oneHourAgo) {
            setRates(cachedData);
            setLoading(false);
            return;
          }
        }

        // Intentar obtener datos frescos de la API
        try {
          const [bcvResponse, paraleloResponse] = await Promise.all([
            fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
            fetch('https://ve.dolarapi.com/v1/dolares/paralelo'),
          ]);

          if (!bcvResponse.ok || !paraleloResponse.ok) {
            throw new Error('No se pudieron obtener las tasas de cambio de ve.dolarapi.com');
          }

          const bcvData = await bcvResponse.json();
          const paraleloData = await paraleloResponse.json();

          if (typeof bcvData.promedio !== 'number' || typeof paraleloData.promedio !== 'number') {
            throw new Error(
              'La estructura de la respuesta de la API es inesperada: falta el campo "promedio" o no es un número',
            );
          }

          const newRates: ExchangeRates = {
            bcv: bcvData.promedio,
            usdt: paraleloData.promedio,
            timestamp: Date.now(),
          };

          setRates(newRates);

          // Guardar en caché
          await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(newRates));
        } catch (apiError) {
          // Si falla la API pero tenemos datos en caché, usarlos
          if (cachedData) {
            setRates(cachedData);
            setError('Usando tasas de cambio en caché (sin conexión a internet)');
          } else {
            throw apiError;
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const averageRate = rates ? (rates.bcv + rates.usdt) / 2 : 0;

  return {
    bcvRate: rates?.bcv ?? 0,
    usdtRate: rates?.usdt ?? 0,
    averageRate,
    loading,
    error,
  };
};
