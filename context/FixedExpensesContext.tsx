import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { FIXED_EXPENSES_KEY } from '../constants/StorageKeys';
import { useNotifications } from '../hooks/useNotifications';
import { FixedExpense } from '../types';

interface FixedExpensesContextType {
  expenses: FixedExpense[];
  addFixedExpense: (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  updateFixedExpense: (updatedExpense: FixedExpense) => void;
  deleteFixedExpense: (id: string) => void;
  isLoading: boolean;
  setExpenses: React.Dispatch<React.SetStateAction<FixedExpense[]>>;
}

const FixedExpensesContext = createContext<FixedExpensesContextType | undefined>(undefined);

export function FixedExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { scheduleFixedExpenseReminder, cancelFixedExpenseReminder, scheduleAllFixedExpenseReminders } =
    useNotifications();

  const loadFixedExpenses = async () => {
    setIsLoading(true);
    try {
      const storedExpenses = await AsyncStorage.getItem(FIXED_EXPENSES_KEY);
      if (storedExpenses) {
        const parsedExpenses: FixedExpense[] = JSON.parse(storedExpenses);
        // Simple migration for old data
        const migratedExpenses = parsedExpenses.map((exp) => {
          if (!exp.frequency) {
            return { ...exp, frequency: 'monthly' };
          }
          return exp;
        });
        setExpenses(migratedExpenses);
      }
    } catch (e) {
      console.error('[loadFixedExpenses] Error al cargar los gastos fijos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFixedExpenses();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveFixedExpenses = async () => {
        try {
          await AsyncStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
        } catch (e) {
          console.error('[saveFixedExpenses] Error al guardar los gastos fijos:', e);
        }
      };
      saveFixedExpenses();
    }
  }, [expenses, isLoading]);

  // Programar notificaciones cuando se cargan los gastos fijos
  useEffect(() => {
    if (!isLoading && expenses.length > 0) {
      scheduleAllFixedExpenseReminders(expenses);
    }
  }, [isLoading, expenses, scheduleAllFixedExpenseReminders]);

  const addFixedExpense = async (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const newExpense: FixedExpense = {
      id: Date.now().toString(),
      lastPaid: undefined,
      ...expenseData,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Programar notificación para el nuevo gasto fijo
    await scheduleFixedExpenseReminder(newExpense);
  };

  const updateFixedExpense = async (updatedExpense: FixedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));

    // Cancelar notificación anterior y programar nueva
    await cancelFixedExpenseReminder(updatedExpense.id);
    await scheduleFixedExpenseReminder(updatedExpense);
  };

  const deleteFixedExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    // Cancelar notificación del gasto eliminado
    await cancelFixedExpenseReminder(id);
  };

  const value = {
    expenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    isLoading,
    setExpenses,
  };

  return <FixedExpensesContext.Provider value={value}>{children}</FixedExpensesContext.Provider>;
}

export function useFixedExpenses() {
  const context = useContext(FixedExpensesContext);
  if (context === undefined) {
    throw new Error('useFixedExpenses must be used within a FixedExpensesProvider');
  }
  return context;
}
