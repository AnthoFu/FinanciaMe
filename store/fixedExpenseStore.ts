import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { FixedExpense, ExpenseFrequency } from '../types';
import { FIXED_EXPENSES_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface FixedExpenseState {
  expenses: FixedExpense[];
  isLoading: boolean;
  addFixedExpense: (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => FixedExpense;
  updateFixedExpense: (updatedExpense: FixedExpense) => void;
  deleteFixedExpense: (id: string) => void;
  setExpenses: (expenses: FixedExpense[] | ((prev: FixedExpense[]) => FixedExpense[])) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useFixedExpenseStore = create<FixedExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setExpenses: (expenses) =>
        set((state) => ({
          expenses: typeof expenses === 'function' ? expenses(state.expenses) : expenses,
        })),

      addFixedExpense: (expenseData) => {
        const newExpense: FixedExpense = {
          id: uuidv4(),
          lastPaid: undefined,
          ...expenseData,
        };
        set((state) => ({ expenses: [newExpense, ...state.expenses] }));
        return newExpense;
      },

      updateFixedExpense: (updatedExpense) => {
        set((state) => ({
          expenses: state.expenses.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)),
        }));
      },

      deleteFixedExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        }));
      },
    }),
    {
      name: FIXED_EXPENSES_KEY,
      storage: createMigratingStorage<FixedExpenseState>('expenses'),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migration for frequency
          const migratedExpenses = state.expenses.map((exp) => {
            if (!exp.frequency) {
              return { ...exp, frequency: 'monthly' as ExpenseFrequency };
            }
            return exp;
          });
          state.setExpenses(migratedExpenses);
          state.setIsLoading(false);
        }
      },
    },
  ),
);
