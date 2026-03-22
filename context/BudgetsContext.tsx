import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Budget } from '../types';
import { useBudgetStore } from '../store/budgetStore';

interface BudgetsContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'creationDate'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getBudgetById: (budgetId: string) => Budget | undefined;
  isLoading: boolean;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const store = useBudgetStore();

  const value = useMemo(
    () => ({
      budgets: store.budgets,
      addBudget: store.addBudget,
      updateBudget: store.updateBudget,
      deleteBudget: store.deleteBudget,
      getBudgetById: store.getBudgetById,
      isLoading: store.isLoading,
    }),
    [store],
  );

  return <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>;
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('[useBudgets] Error: useBudgets must be used within a BudgetsProvider');
  }
  return context;
}
