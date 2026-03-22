import React, { createContext, ReactNode, useContext, useEffect, useMemo, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { FixedExpense } from '../types';
import { useFixedExpenseStore } from '../store/fixedExpenseStore';

interface FixedExpensesContextType {
  expenses: FixedExpense[];
  addFixedExpense: (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  updateFixedExpense: (updatedExpense: FixedExpense) => void;
  deleteFixedExpense: (id: string) => void;
  isLoading: boolean;
  setExpenses: (expenses: FixedExpense[] | ((prev: FixedExpense[]) => FixedExpense[])) => void;
}

const FixedExpensesContext = createContext<FixedExpensesContextType | undefined>(undefined);

export function FixedExpensesProvider({ children }: { children: ReactNode }) {
  const store = useFixedExpenseStore();
  const { scheduleFixedExpenseReminder, cancelFixedExpenseReminder, scheduleAllFixedExpenseReminders } =
    useNotifications();

  // Programar notificaciones cuando se cargan los gastos fijos
  useEffect(() => {
    if (!store.isLoading && store.expenses.length > 0) {
      scheduleAllFixedExpenseReminders(store.expenses);
    }
  }, [store.isLoading, store.expenses, scheduleAllFixedExpenseReminders]);

  const addFixedExpense = useCallback(
    async (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
      const newExpense = store.addFixedExpense(expenseData);
      // Programar notificación para el nuevo gasto fijo
      await scheduleFixedExpenseReminder(newExpense);
    },
    [store, scheduleFixedExpenseReminder],
  );

  const updateFixedExpense = useCallback(
    async (updatedExpense: FixedExpense) => {
      store.updateFixedExpense(updatedExpense);
      // Cancelar notificación anterior y programar nueva
      await cancelFixedExpenseReminder(updatedExpense.id);
      await scheduleFixedExpenseReminder(updatedExpense);
    },
    [store, cancelFixedExpenseReminder, scheduleFixedExpenseReminder],
  );

  const deleteFixedExpense = useCallback(
    async (id: string) => {
      store.deleteFixedExpense(id);
      // Cancelar notificación del gasto eliminado
      await cancelFixedExpenseReminder(id);
    },
    [store, cancelFixedExpenseReminder],
  );

  const value = useMemo(
    () => ({
      expenses: store.expenses,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      isLoading: store.isLoading,
      setExpenses: store.setExpenses,
    }),
    [store, addFixedExpense, updateFixedExpense, deleteFixedExpense],
  );

  return <FixedExpensesContext.Provider value={value}>{children}</FixedExpensesContext.Provider>;
}

export function useFixedExpenses() {
  const context = useContext(FixedExpensesContext);
  if (context === undefined) {
    throw new Error('useFixedExpenses must be used within a FixedExpensesProvider');
  }
  return context;
}
