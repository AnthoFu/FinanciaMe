import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FixedExpense } from '../types';
import { FIXED_EXPENSES_KEY } from '../constants/StorageKeys';

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

  const loadFixedExpenses = async () => {
    setIsLoading(true);
    try {
      const storedExpenses = await AsyncStorage.getItem(FIXED_EXPENSES_KEY);
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
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

  const addFixedExpense = (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const newExpense: FixedExpense = {
      id: Date.now().toString(),
      lastPaid: undefined,
      ...expenseData,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateFixedExpense = (updatedExpense: FixedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  };

  const deleteFixedExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
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
