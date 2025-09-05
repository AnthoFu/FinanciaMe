import { useState, useEffect } from 'react';

interface ExchangeRates {
  bcv: number;
  usdt: number;
}

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
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

        setRates({ bcv: bcvData.promedio, usdt: paraleloData.promedio });
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
