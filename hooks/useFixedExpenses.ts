import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FixedExpense } from '../types';
import { FIXED_EXPENSES_KEY } from '../constants/StorageKeys';

export function useFixedExpenses() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFixedExpenses = async () => {
      setIsLoading(true);
      try {
        const storedExpenses = await AsyncStorage.getItem(FIXED_EXPENSES_KEY);
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        }
      } catch (e) {
        console.error("Failed to load fixed expenses.", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadFixedExpenses();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveFixedExpenses = async () => {
        try {
          await AsyncStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
        } catch (e) {
          console.error("Failed to save fixed expenses.", e);
        }
      };
      saveFixedExpenses();
    }
  }, [expenses, isLoading]);

  const addFixedExpense = (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const newExpense: FixedExpense = {
      id: Date.now().toString(),
      lastPaid: undefined, // Ensure new expenses can be paid this month
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateFixedExpense = (updatedExpense: FixedExpense) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
  };

  const deleteFixedExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  return { expenses, setExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense, isLoading };
}
