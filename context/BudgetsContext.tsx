import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BUDGETS_KEY } from '../constants/StorageKeys';
import { Budget } from '../types';

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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load budgets from storage
  useEffect(() => {
    const loadBudgets = async () => {
      setIsLoading(true);
      try {
        const storedBudgets = await AsyncStorage.getItem(BUDGETS_KEY);
        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }
      } catch (error) {
        console.error('[loadBudgets] Error al cargar los presupuestos desde el almacenamiento:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBudgets();
  }, []);

  // Save budgets to storage
  useEffect(() => {
    if (!isLoading) {
      const saveBudgets = async () => {
        try {
          await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
        } catch (error) {
          console.error('[saveBudgets] Error al guardar los presupuestos en el almacenamiento:', error);
        }
      };
      saveBudgets();
    }
  }, [budgets, isLoading]);

  const addBudget = (budgetData: Omit<Budget, 'id' | 'creationDate'>) => {
    const newBudget: Budget = {
      id: uuidv4(),
      creationDate: new Date().toISOString(),
      ...budgetData,
    };
    setBudgets((prevBudgets) => [newBudget, ...prevBudgets]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets((prevBudgets) => prevBudgets.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget)));
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== budgetId));
  };

  const getBudgetById = (budgetId: string) => {
    return budgets.find((budget) => budget.id === budgetId);
  };

  const value = {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,
    isLoading,
  };

  return <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>;
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('[useBudgets] Error: useBudgets must be used within a BudgetsProvider');
  }
  return context;
}
