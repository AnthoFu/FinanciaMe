import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Budget } from '../types';
import { BUDGETS_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  addBudget: (budgetData: Omit<Budget, 'id' | 'creationDate'>) => void;
  updateBudget: (updatedBudget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getBudgetById: (budgetId: string) => Budget | undefined;
  setIsLoading: (loading: boolean) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      addBudget: (budgetData) => {
        const newBudget: Budget = {
          id: uuidv4(),
          creationDate: new Date().toISOString(),
          ...budgetData,
        };
        set((state) => ({ budgets: [newBudget, ...state.budgets] }));
      },

      updateBudget: (updatedBudget) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)),
        }));
      },

      deleteBudget: (budgetId) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== budgetId),
        }));
      },

      getBudgetById: (budgetId) => {
        return get().budgets.find((b) => b.id === budgetId);
      },
    }),
    {
      name: BUDGETS_KEY,
      storage: createMigratingStorage<BudgetState>('budgets'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
