import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { Category } from '../types';
import { useCategoryStore } from '../store/categoryStore';

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, icon: string, type: 'income' | 'expense') => void;
  removeCategory: (categoryId: string) => void;
  getCategoryById: (categoryId: string) => Category | undefined;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const store = useCategoryStore();

  const value = useMemo(
    () => ({
      categories: store.categories,
      addCategory: store.addCategory,
      removeCategory: store.removeCategory,
      getCategoryById: store.getCategoryById,
      isLoading: store.isLoading,
    }),
    [store],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('[useCategories] Error: useCategories debe utilizarse con un CategoriesProvider');
  }
  return context;
}
