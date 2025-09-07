import { useMemo } from 'react';
import { Wallet } from '../types';

export const useFinancialSummary = (
  wallets: Wallet[],
  bcvRate: number | null,
  usdtRate: number | null,
  averageRate: number | null,
  ratesLoading: boolean,
) => {
  const summary = useMemo(() => {
    if (ratesLoading || !bcvRate || !usdtRate || !averageRate) {
      return {
        consolidatedBcv: 0,
        consolidatedAverage: 0,
        byCurrency: { VEF: 0, USD: 0, USDT: 0 },
      };
    }

    const byCurrency = wallets.reduce(
      (acc, wallet) => {
        acc[wallet.currency] = (acc[wallet.currency] || 0) + wallet.balance;
        return acc;
      },
      { VEF: 0, USD: 0, USDT: 0 } as Record<'VEF' | 'USD' | 'USDT', number>,
    );

    const consolidatedBcv = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VEF') {
        return total + wallet.balance / bcvRate;
      }
      if (wallet.currency === 'USDT') {
        return total + (wallet.balance * usdtRate) / bcvRate;
      }
      return total + wallet.balance;
    }, 0);

    const consolidatedAverage = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VEF') {
        return total + wallet.balance / averageRate;
      }
      if (wallet.currency === 'USDT') {
        return total + (wallet.balance * usdtRate) / averageRate;
      }
      return total + wallet.balance;
    }, 0);

    return { consolidatedBcv, consolidatedAverage, byCurrency };
  }, [wallets, bcvRate, usdtRate, averageRate, ratesLoading]);

  return summary;
};
