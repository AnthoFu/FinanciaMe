import { useCallback } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { FixedExpense } from '../types';
import { useWallets } from '../context/WalletsContext';
import { useTransactions } from '../context/TransactionsContext';
import { useFixedExpenses } from '../context/FixedExpensesContext';
import { useExchangeRates } from './useExchangeRates';

export function useFixedExpensesHandler() {
  const { wallets, updateBalancesForTransaction } = useWallets();
  const { addTransaction, isLoading: transactionsLoading } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();
  const { bcvRate, usdtRate, averageRate, loading: ratesLoading } = useExchangeRates();

  const isWithinDateRange = useCallback((expense: FixedExpense, date: Date): boolean => {
    const start = expense.startDate ? new Date(expense.startDate) : null;
    const end = expense.endDate ? new Date(expense.endDate) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  }, []);

  const handlePayDueExpenses = useCallback(
    async (dueExpenses: FixedExpense[]) => {
      if (!bcvRate || !usdtRate || !averageRate) return;

      const nowString = new Date().toISOString();
      const paidExpensesIds: string[] = [];
      const failedExpenses: string[] = [];

      // We process them one by one using the centralized logic
      for (const expense of dueExpenses) {
        const wallet = wallets.find((w) => w.id === expense.walletId);
        if (!wallet) {
          failedExpenses.push(`${expense.name} (Billetera no encontrada)`);
          continue;
        }

        let expenseCostInWalletCurrency = expense.amount;
        if (expense.currency !== wallet.currency) {
          if (expense.currency === 'USD' && wallet.currency === 'VES') expenseCostInWalletCurrency *= bcvRate;
          else if (expense.currency === 'VES' && wallet.currency === 'USD') expenseCostInWalletCurrency /= bcvRate;
        }

        // Use centralized balance update logic
        const result = updateBalancesForTransaction(expenseCostInWalletCurrency, 'expense', wallet.id);

        if (result.success) {
          addTransaction({
            amount: expenseCostInWalletCurrency,
            description: `Gasto fijo: ${expense.name}`,
            type: 'expense',
            date: nowString,
            walletId: wallet.id,
            categoryId: expense.categoryId,
          });
          paidExpensesIds.push(expense.id);
        } else {
          failedExpenses.push(`${expense.name} (${result.error || 'Saldo insuficiente'})`);
        }
      }

      // Update the 'lastPaid' date for the successful expenses
      if (paidExpensesIds.length > 0) {
        setExpenses((prev) =>
          prev.map((exp) => (paidExpensesIds.includes(exp.id) ? { ...exp, lastPaid: nowString } : exp)),
        );
      }

      let summaryMessage =
        paidExpensesIds.length > 0
          ? `Pagos realizados: ${dueExpenses
              .filter((e) => paidExpensesIds.includes(e.id))
              .map((e) => e.name)
              .join(', ')}.`
          : '';
      if (failedExpenses.length > 0) summaryMessage += `\n\nPagos fallidos: ${failedExpenses.join('; ')}.`;
      if (summaryMessage) Alert.alert('Resumen de Pagos', summaryMessage);
    },
    [bcvRate, usdtRate, averageRate, wallets, updateBalancesForTransaction, addTransaction, setExpenses],
  );

  const promptToPayDueExpenses = useCallback(
    (dueExpenses: FixedExpense[]) => {
      const expenseNames = dueExpenses.map((e) => e.name).join(', ');
      Alert.alert('Gastos Fijos Pendientes', `Tienes pagos pendientes para: ${expenseNames}. ¿Deseas pagarlos ahora?`, [
        { text: 'Más Tarde', style: 'cancel' },
        { text: 'Pagar Ahora', onPress: () => handlePayDueExpenses(dueExpenses) },
      ]);
    },
    [handlePayDueExpenses],
  );

  const checkDueFixedExpenses = useCallback(async () => {
    // Avoid checking if data is still loading
    if (fixedExpensesLoading || transactionsLoading || ratesLoading) return;

    const now = new Date();
    const dueExpenses = expenses.filter((exp) => {
      if (!exp.startDate || !isWithinDateRange(exp, now)) {
        return false;
      }

      const lastPaid = exp.lastPaid ? new Date(exp.lastPaid) : null;
      const startDate = new Date(exp.startDate);
      let currentDueDate = new Date(startDate);

      while (true) {
        let nextDueDate = new Date(currentDueDate);
        switch (exp.frequency) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDueDate.setDate(nextDueDate.getDate() + 14);
            break;
          case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
          case 'monthly':
            if (typeof exp.dayOfMonth !== 'number') return false;
            nextDueDate.setMonth(nextDueDate.getMonth() + 1, exp.dayOfMonth);
            break;
        }
        if (nextDueDate > now) {
          break;
        }
        currentDueDate = nextDueDate;
      }

      if (!lastPaid || lastPaid < currentDueDate) {
        return true;
      }

      return false;
    });

    if (dueExpenses.length > 0) {
      promptToPayDueExpenses(dueExpenses);
    }
  }, [
    fixedExpensesLoading,
    transactionsLoading,
    ratesLoading,
    expenses,
    isWithinDateRange,
    promptToPayDueExpenses,
  ]);

  return { checkDueFixedExpenses };
}
