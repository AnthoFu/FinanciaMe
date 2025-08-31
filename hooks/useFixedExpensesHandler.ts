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

  const handlePayDueExpenses = useCallback(async (dueExpenses: FixedExpense[]) => {
    if (!bcvRate || !usdtRate) return;
    let tempWallets = [...wallets];
    let tempTransactions = [...transactions];
    let tempFixedExpenses = [...expenses];
    const nowString = new Date().toISOString();
    const paidExpensesIds: string[] = [];
    const failedExpenses: string[] = [];

    for (const expense of dueExpenses) {
      const wallet = tempWallets.find(w => w.id === expense.walletId);
      if (!wallet) {
        failedExpenses.push(`${expense.name} (Billetera no encontrada)`);
        continue;
      }
      let expenseCostInWalletCurrency = expense.amount;
      if (expense.currency !== wallet.currency) {
        if (expense.currency === 'USD' && wallet.currency === 'VEF') expenseCostInWalletCurrency *= bcvRate;
        else if (expense.currency === 'VEF' && wallet.currency === 'USD') expenseCostInWalletCurrency /= bcvRate;
      }
      if (wallet.balance >= expenseCostInWalletCurrency) {
        wallet.balance -= expenseCostInWalletCurrency;
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
    setExpenses(tempFixedExpenses.map(exp => paidExpensesIds.includes(exp.id) ? { ...exp, lastPaid: nowString } : exp));
    let summaryMessage = paidExpensesIds.length > 0 ? `Pagos realizados: ${dueExpenses.filter(e => paidExpensesIds.includes(e.id)).map(e => e.name).join(', ')}.` : '';
    if (failedExpenses.length > 0) summaryMessage += `\n\nPagos fallidos: ${failedExpenses.join('; ')}.`;
    Alert.alert("Resumen de Pagos", summaryMessage);
  }, [bcvRate, usdtRate, wallets, transactions, expenses, setWallets, setTransactions, setExpenses]);

  const promptToPayDueExpenses = useCallback((dueExpenses: FixedExpense[]) => {
    const expenseNames = dueExpenses.map(e => e.name).join(', ');
    Alert.alert(
      'Gastos Fijos Pendientes',
      `Tienes pagos pendientes para: ${expenseNames}. ¿Deseas pagarlos ahora?`,
      [{ text: 'Más Tarde', style: 'cancel' }, { text: 'Pagar Ahora', onPress: () => handlePayDueExpenses(dueExpenses) }]
    );
  }, [handlePayDueExpenses]);

  const checkDueFixedExpenses = useCallback(async () => {
    if (fixedExpensesLoading || walletsLoading || ratesLoading) return;
    const now = new Date();
    const dueExpenses = expenses.filter(exp => {
      const lastPaid = exp.lastPaid ? new Date(exp.lastPaid) : null;
      const isDueByMonth = !lastPaid || lastPaid.getFullYear() < now.getFullYear() || lastPaid.getMonth() < now.getMonth();
      const isDueByDay = now.getDate() >= exp.dayOfMonth;
      return isDueByMonth && isDueByDay && isWithinDateRange(exp, now);
    });
    if (dueExpenses.length > 0) promptToPayDueExpenses(dueExpenses);
  }, [fixedExpensesLoading, walletsLoading, ratesLoading, expenses, isWithinDateRange, promptToPayDueExpenses]);

  return { checkDueFixedExpenses };
}
