import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { SavingsGoal } from '../types';
import { SAVINGS_GOALS_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface SavingsGoalState {
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  addSavingsGoal: (goalData: Omit<SavingsGoal, 'id' | 'creationDate'>) => void;
  updateSavingsGoal: (updatedGoal: SavingsGoal) => void;
  deleteSavingsGoal: (goalId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSavingsGoalStore = create<SavingsGoalState>()(
  persist(
    (set) => ({
      savingsGoals: [],
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      addSavingsGoal: (goalData) => {
        const newGoal: SavingsGoal = {
          id: uuidv4(),
          creationDate: new Date().toISOString(),
          ...goalData,
        };
        set((state) => ({ savingsGoals: [newGoal, ...state.savingsGoals] }));
      },

      updateSavingsGoal: (updatedGoal) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
        }));
      },

      deleteSavingsGoal: (goalId) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== goalId),
        }));
      },
    }),
    {
      name: SAVINGS_GOALS_KEY,
      storage: createMigratingStorage<SavingsGoalState>('savingsGoals'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
