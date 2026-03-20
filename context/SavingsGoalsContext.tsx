import React, { createContext, ReactNode, useContext, useMemo, useCallback } from 'react';
import { SavingsGoal, Transaction } from '../types';
import { useCategories } from './CategoriesContext';
import { useTransactions } from './TransactionsContext';
import { useWallets } from './WalletsContext';
import { useSavingsGoalStore } from '../store/savingsGoalStore';

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
  const store = useSavingsGoalStore();
  const { transactions, addTransaction } = useTransactions();
  const { categories, addCategory } = useCategories();
  const { updateBalancesForTransaction } = useWallets();

  const getContributionsForGoal = useCallback(
    (goalId: string) => {
      return transactions.filter((t) => t.goalId === goalId);
    },
    [transactions],
  );

  const getGoalProgress = useCallback(
    (goalId: string) => {
      const contributions = getContributionsForGoal(goalId);
      return contributions.reduce((total, contribution) => total + contribution.amount, 0);
    },
    [getContributionsForGoal],
  );

  const addContribution = useCallback(
    async (
      goal: SavingsGoal,
      walletId: string,
      amount: number,
      description?: string,
    ): Promise<{ success: boolean; message: string }> => {
      const result = updateBalancesForTransaction(amount, 'expense', walletId);

      if (!result.success) {
        return { success: false, message: result.error || 'Error al actualizar el saldo.' };
      }

      let savingsCategory = categories.find((c) => c.name === 'Ahorros' && c.type === 'expense');
      if (!savingsCategory) {
        addCategory('Ahorros', 'banknote.fill', 'expense');
        const newCategory = categories.find((c) => c.name === 'Ahorros');
        savingsCategory = newCategory;
      }

      const categoryId = savingsCategory?.id || '11';

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
    },
    [updateBalancesForTransaction, categories, addCategory, addTransaction],
  );

  const value = useMemo(
    () => ({
      savingsGoals: store.savingsGoals,
      addSavingsGoal: store.addSavingsGoal,
      updateSavingsGoal: store.updateSavingsGoal,
      deleteSavingsGoal: store.deleteSavingsGoal,
      addContribution,
      getContributionsForGoal,
      getGoalProgress,
      isLoading: store.isLoading,
    }),
    [store, addContribution, getContributionsForGoal, getGoalProgress],
  );

  return <SavingsGoalsContext.Provider value={value}>{children}</SavingsGoalsContext.Provider>;
}

export function useSavingsGoals() {
  const context = useContext(SavingsGoalsContext);
  if (context === undefined) {
    throw new Error('[useSavingsGoals] Error: useSavingsGoals must be used within a SavingsGoalsProvider');
  }
  return context;
}
