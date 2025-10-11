import { useCallback } from 'react';
import { Alert } from 'react-native';
import { FixedExpense, Wallet, Transaction } from '../types';

interface UseFixedExpensesHandlerProps {
  wallets: Wallet[];
  setWallets: (wallets: Wallet[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  expenses: FixedExpense[];
  setExpenses: (expenses: FixedExpense[]) => void;
  bcvRate: number | null;
  usdtRate: number | null;
  averageRate: number | null;
  fixedExpensesLoading: boolean;
  walletsLoading: boolean;
  ratesLoading: boolean;
}

export function useFixedExpensesHandler({
  wallets,
  setWallets,
  transactions,
  setTransactions,
  expenses,
  setExpenses,
  bcvRate,
  usdtRate,
  averageRate,
  fixedExpensesLoading,
  walletsLoading,
  ratesLoading,
}: UseFixedExpensesHandlerProps) {
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
      let tempWallets = JSON.parse(JSON.stringify(wallets));
      let tempTransactions = [...transactions];
      const nowString = new Date().toISOString();
      const paidExpensesIds: string[] = [];
      const failedExpenses: string[] = [];

      for (const expense of dueExpenses) {
        const walletIndex = tempWallets.findIndex((w: Wallet) => w.id === expense.walletId);
        if (walletIndex === -1) {
          failedExpenses.push(`${expense.name} (Billetera no encontrada)`);
          continue;
        }
        let expenseCostInWalletCurrency = expense.amount;
        const wallet = tempWallets[walletIndex];

        if (expense.currency !== wallet.currency) {
          if (expense.currency === 'USD' && wallet.currency === 'VEF') expenseCostInWalletCurrency *= bcvRate;
          else if (expense.currency === 'VEF' && wallet.currency === 'USD') expenseCostInWalletCurrency /= bcvRate;
        }

        if (wallet.balance >= expenseCostInWalletCurrency) {
          tempWallets[walletIndex].balance -= expenseCostInWalletCurrency;
          tempTransactions.unshift({
            id: `${Date.now()}-${expense.id}`,
            amount: expenseCostInWalletCurrency,
            description: `Gasto fijo: ${expense.name}`,
            type: 'expense',
            date: nowString,
            walletId: wallet.id,
            categoryId: expense.categoryId,
          });
          paidExpensesIds.push(expense.id);
        } else {
          failedExpenses.push(`${expense.name} (Fondos insuficientes)`);
        }
      }

      setWallets(tempWallets);
      setTransactions(tempTransactions);

      const newExpenses = expenses.map((exp: FixedExpense) =>
        paidExpensesIds.includes(exp.id) ? { ...exp, lastPaid: nowString } : exp,
      );
      setExpenses(newExpenses);
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
    [bcvRate, usdtRate, averageRate, wallets, transactions, expenses, setWallets, setTransactions, setExpenses],
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
    if (fixedExpensesLoading || walletsLoading || ratesLoading) return;
    const now = new Date();

    const dueExpenses = expenses.filter((exp) => {
      if (!exp.startDate || !isWithinDateRange(exp, now)) {
        return false;
      }

      const lastPaid = exp.lastPaid ? new Date(exp.lastPaid) : null;

      // Get the anchor date for the expense, which is its start date.
      const startDate = new Date(exp.startDate);

      // Determine the due date for the current cycle.
      let currentDueDate = new Date(startDate);

      // Logic to find the most recent due date that is <= now
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
          break; // `currentDueDate` is the one we care about
        }
        currentDueDate = nextDueDate;
      }

      // Now `currentDueDate` is the most recent date the expense should have been paid.
      // An expense is due if this date is after the last payment date.
      if (!lastPaid || lastPaid < currentDueDate) {
        return true;
      }

      return false;
    });

    if (dueExpenses.length > 0) {
      promptToPayDueExpenses(dueExpenses);
    }
  }, [fixedExpensesLoading, walletsLoading, ratesLoading, expenses, isWithinDateRange, promptToPayDueExpenses]);

  return { checkDueFixedExpenses };
}
