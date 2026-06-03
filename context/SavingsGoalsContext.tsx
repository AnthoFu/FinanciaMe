import React, { createContext, ReactNode, useContext, useMemo, useCallback } from 'react';
import { SavingsGoal, Transaction } from '../types';
import { useCategories } from './CategoriesContext';
import { useTransactions } from './TransactionsContext';
import { useWallets } from './WalletsContext';
import { useSavingsGoalStore } from '../store/savingsGoalStore';

interface SavingsGoalsContextType {
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'creationDate'>) => void;
  createSavingsGoalWithWallet: (goalData: Omit<SavingsGoal, 'id' | 'creationDate' | 'linkedWalletId'>) => Promise<void>;
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
  const { updateBalancesForTransaction, addWallet, wallets, updateBalancesForTransfer } = useWallets();

  const getContributionsForGoal = useCallback(
    (goalId: string) => {
      return transactions.filter((t) => t.goalId === goalId);
    },
    [transactions],
  );

  const getGoalProgress = useCallback(
    (goalId: string) => {
      const contributions = getContributionsForGoal(goalId);
      return contributions.reduce((total, contribution) => {
        // Si es un ahorro vía transferencia, solo contamos el ingreso (transfer-in)
        // en la billetera de meta para evitar duplicar (transfer-out + transfer-in)
        if (contribution.categoryId === 'transfer-in') {
          return total + contribution.amount;
        }
        // Si es un ahorro vía gasto (método antiguo sin billetera), contamos el monto
        if (contribution.type === 'expense' && contribution.categoryId !== 'transfer-out') {
          return total + contribution.amount;
        }
        return total;
      }, 0);
    },
    [getContributionsForGoal],
  );

  const createSavingsGoalWithWallet = useCallback(
    async (goalData: Omit<SavingsGoal, 'id' | 'creationDate' | 'linkedWalletId'>) => {
      const walletId = addWallet({
        name: `${goalData.name} (Ahorro)`,
        balance: 0,
        currency: goalData.currency,
        isSavings: true,
      });

      store.addSavingsGoal({
        ...goalData,
        linkedWalletId: walletId,
      });
    },
    [addWallet, store],
  );

  const addContribution = useCallback(
    async (
      goal: SavingsGoal,
      walletId: string,
      amount: number,
      description?: string,
    ): Promise<{ success: boolean; message: string }> => {
      if (goal.linkedWalletId) {
        // NEW LOGIC: Use Transfer
        const fromWallet = wallets.find((w) => w.id === walletId);
        const toWallet = wallets.find((w) => w.id === goal.linkedWalletId);

        if (!fromWallet || !toWallet) {
          return { success: false, message: 'Billetera no encontrada.' };
        }

        const result = updateBalancesForTransfer(walletId, goal.linkedWalletId, amount, amount);
        if (!result.success) {
          return { success: false, message: result.error || 'Error al realizar la transferencia de ahorro.' };
        }

        const date = new Date().toISOString();

        // We create the transactions manually instead of using addTransfer
        // to ensure they are tagged with goalId
        addTransaction({
          amount,
          description: `Ahorro para "${goal.name}"${description ? `: ${description}` : ''}`,
          type: 'expense',
          date,
          walletId,
          categoryId: 'transfer-out',
          goalId: goal.id,
        });

        addTransaction({
          amount,
          description: `Ahorro recibido para "${goal.name}"${description ? `: ${description}` : ''}`,
          type: 'income',
          date,
          walletId: goal.linkedWalletId,
          categoryId: 'transfer-in',
          goalId: goal.id,
        });

        return { success: true, message: 'Ahorro transferido con éxito.' };
      }

      // OLD LOGIC: Use Expense (Fallback for goals without linked wallets)
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
    [updateBalancesForTransaction, categories, addCategory, addTransaction, wallets, updateBalancesForTransfer],
  );

  const value = useMemo(
    () => ({
      savingsGoals: store.savingsGoals,
      addSavingsGoal: store.addSavingsGoal,
      createSavingsGoalWithWallet,
      updateSavingsGoal: store.updateSavingsGoal,
      deleteSavingsGoal: store.deleteSavingsGoal,
      addContribution,
      getContributionsForGoal,
      getGoalProgress,
      isLoading: store.isLoading,
    }),
    [store, addContribution, getContributionsForGoal, getGoalProgress, createSavingsGoalWithWallet],
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
