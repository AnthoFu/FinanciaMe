import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SAVINGS_GOALS_KEY } from '../constants/StorageKeys';
import { SavingsGoal, Transaction } from '../types';
import { useCategories } from './CategoriesContext';
import { useTransactions } from './TransactionsContext';
import { useWallets } from './WalletsContext';

interface SavingsGoalsContextType {
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'creationDate'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (goalId: string) => void;
  addContribution: (
    goal: SavingsGoal,
    walletId: string,
    amount: number,
    description?: string,
  ) => Promise<{ success: boolean; message: string }>;
  getContributionsForGoal: (goalId: string) => Transaction[];
  getGoalProgress: (goalId: string) => number;
  isLoading: boolean;
}

const SavingsGoalsContext = createContext<SavingsGoalsContextType | undefined>(undefined);

export function SavingsGoalsProvider({ children }: { children: ReactNode }) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions, addTransaction } = useTransactions();
  const { categories, addCategory } = useCategories();
  const { updateBalancesForTransaction } = useWallets();

  // Load goals from storage
  useEffect(() => {
    const loadSavingsGoals = async () => {
      setIsLoading(true);
      try {
        const storedGoals = await AsyncStorage.getItem(SAVINGS_GOALS_KEY);
        if (storedGoals) {
          setSavingsGoals(JSON.parse(storedGoals));
        }
      } catch (error) {
        console.error('[loadSavingsGoals] Error al cargar las metas de ahorro desde el almacenamiento:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavingsGoals();
  }, []);

  // Save goals to storage
  useEffect(() => {
    if (!isLoading) {
      const saveSavingsGoals = async () => {
        try {
          await AsyncStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(savingsGoals));
        } catch (error) {
          console.error('[saveSavingsGoals] Error al guardar las metas de ahorro en el almacenamiento:', error);
        }
      };
      saveSavingsGoals();
    }
  }, [savingsGoals, isLoading]);

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'creationDate'>) => {
    const newGoal: SavingsGoal = {
      id: uuidv4(),
      creationDate: new Date().toISOString(),
      ...goalData,
    };
    setSavingsGoals((prevGoals) => [newGoal, ...prevGoals]);
  };

  const updateSavingsGoal = (updatedGoal: SavingsGoal) => {
    setSavingsGoals((prevGoals) => prevGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)));
  };

  const deleteSavingsGoal = (goalId: string) => {
    setSavingsGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
  };

  const getContributionsForGoal = (goalId: string) => {
    return transactions.filter((t) => t.goalId === goalId);
  };

  const getGoalProgress = (goalId: string) => {
    const contributions = getContributionsForGoal(goalId);
    return contributions.reduce((total, contribution) => total + contribution.amount, 0);
  };

  const addContribution = async (
    goal: SavingsGoal,
    walletId: string,
    amount: number,
    description?: string,
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Update wallet balance using centralized logic
    const result = updateBalancesForTransaction(amount, 'expense', walletId);

    if (!result.success) {
      return { success: false, message: result.error || 'Error al actualizar el saldo.' };
    }

    // 2. Find or create a 'Savings' category
    let savingsCategory = categories.find((c) => c.name === 'Ahorros' && c.type === 'expense');
    if (!savingsCategory) {
      addCategory('Ahorros', 'banknote.fill', 'expense');
      const newCategory = categories.find((c) => c.name === 'Ahorros');
      savingsCategory = newCategory;
    }

    const categoryId = savingsCategory?.id || '11';

    // 3. Add the transaction record
    addTransaction({
      amount,
      description: `Ahorro para "${goal.name}"${description ? `: ${description}` : ''}`,
      type: 'expense',
      date: new Date().toISOString(),
      walletId,
      categoryId,
      goalId: goal.id,
    });

    return { success: true, message: 'Ahorro añadido con éxito.' };
  };

  const value = {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addContribution,
    getContributionsForGoal,
    getGoalProgress,
    isLoading,
  };

  return <SavingsGoalsContext.Provider value={value}>{children}</SavingsGoalsContext.Provider>;
}

export function useSavingsGoals() {
  const context = useContext(SavingsGoalsContext);
  if (context === undefined) {
    throw new Error('[useSavingsGoals] Error: useSavingsGoals must be used within a SavingsGoalsProvider');
  }
  return context;
}
