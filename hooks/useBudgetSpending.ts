import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { useWallets } from '../context/WalletsContext';
import { Budget } from '../types';
import { useExchangeRates } from './useExchangeRates';

export function useBudgetSpending(budget: Budget) {
  const { transactions } = useTransactions();
  const { wallets } = useWallets();
  const { averageRate } = useExchangeRates();

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
      if (!wallet || averageRate === 0) return sum;

      let transactionAmount = t.amount;
      const budgetCurrency = budget.currency === 'USDT' ? 'USD' : budget.currency;
      const walletCurrency = wallet.currency === 'USDT' ? 'USD' : wallet.currency;

      if (budgetCurrency === 'USD' && walletCurrency === 'VES') {
        transactionAmount = t.amount / averageRate;
      } else if (budgetCurrency === 'VES' && walletCurrency === 'USD') {
        transactionAmount = t.amount * averageRate;
      }

      return sum + transactionAmount;
    }, 0);
  }, [transactions, wallets, averageRate, budget]);

  return spending;
}
