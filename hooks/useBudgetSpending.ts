import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { useWallets } from '../context/WalletsContext';
import { Budget } from '../types';
import { useExchangeRates } from './useExchangeRates';

export function useBudgetSpending(budget: Budget) {
  const { transactions } = useTransactions();
  const { wallets } = useWallets();
  const { bcvRate, usdtRate, eurRate, averageRate } = useExchangeRates();

  const spending = useMemo(() => {
    if (!budget) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const relevantTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const periodMatch =
        budget.period === 'mensual'
          ? transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
          : transactionDate.getFullYear() === currentYear;

      return t.categoryId === budget.categoryId && t.type === 'expense' && periodMatch;
    });

    return relevantTransactions.reduce((sum, t) => {
      const wallet = wallets.find((w) => w.id === t.walletId);
      if (!wallet) return sum;

      if (budget.currency === wallet.currency) {
        return sum + t.amount;
      }

      // 1. Convertir monto de transacción (moneda billetera) a VES
      let amountInVES = t.amount;
      if (wallet.currency === 'USD') amountInVES = t.amount * bcvRate;
      else if (wallet.currency === 'USDT') amountInVES = t.amount * usdtRate;
      else if (wallet.currency === 'EUR') amountInVES = t.amount * eurRate;

      // 2. Convertir de VES a moneda del presupuesto
      let transactionAmountInBudgetCurrency = amountInVES;
      if (budget.currency === 'USD') transactionAmountInBudgetCurrency = amountInVES / bcvRate;
      else if (budget.currency === 'USDT') transactionAmountInBudgetCurrency = amountInVES / usdtRate;
      else if (budget.currency === 'EUR') transactionAmountInBudgetCurrency = amountInVES / eurRate;
      // Si budget.currency es VES, se queda igual.

      // Manejo de seguridad para divisiones por cero
      if (!isFinite(transactionAmountInBudgetCurrency) || isNaN(transactionAmountInBudgetCurrency)) {
        return sum;
      }

      return sum + transactionAmountInBudgetCurrency;
    }, 0);
  }, [transactions, wallets, bcvRate, usdtRate, eurRate, averageRate, budget]);

  return spending;
}
