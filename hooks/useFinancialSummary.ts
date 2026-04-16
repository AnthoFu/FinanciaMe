import { useMemo } from 'react';
import { Wallet } from '../types';

export const useFinancialSummary = (
  wallets: Wallet[],
  bcvRate: number | null,
  usdtRate: number | null,
  eurRate: number | null,
  averageRate: number | null,
  ratesLoading: boolean,
) => {
  const summary = useMemo(() => {
    if (ratesLoading || !bcvRate || !usdtRate || !averageRate || !eurRate) {
      return {
        consolidatedBcv: 0,
        consolidatedAverage: 0,
        byCurrency: { VES: 0, USD: 0, USDT: 0, EUR: 0 },
      };
    }

    const byCurrency = wallets.reduce(
      (acc, wallet) => {
        acc[wallet.currency] = (acc[wallet.currency] || 0) + wallet.balance;
        return acc;
      },
      { VES: 0, USD: 0, USDT: 0, EUR: 0 } as Record<'VES' | 'USD' | 'USDT' | 'EUR', number>,
    );

    const consolidatedBcv = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VES') {
        return total + wallet.balance / bcvRate;
      }
      if (wallet.currency === 'USDT') {
        return total + (wallet.balance * usdtRate) / bcvRate;
      }
      if (wallet.currency === 'EUR') {
        return total + (wallet.balance * eurRate) / bcvRate;
      }
      return total + wallet.balance;
    }, 0);

    const consolidatedAverage = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VES') {
        return total + wallet.balance / averageRate;
      }
      if (wallet.currency === 'USDT') {
        return total + (wallet.balance * usdtRate) / averageRate;
      }
      if (wallet.currency === 'EUR') {
        // Para promedio usamos la relación EUR/VES dividida por el promedio de USD/VES
        return total + (wallet.balance * eurRate) / averageRate;
      }
      return total + wallet.balance;
    }, 0);

    return { consolidatedBcv, consolidatedAverage, byCurrency };
  }, [wallets, bcvRate, usdtRate, eurRate, averageRate, ratesLoading]);

  return summary;
};
