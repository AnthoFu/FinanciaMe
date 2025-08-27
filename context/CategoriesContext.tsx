import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSACTION_CATEGORIES as DEFAULT_CATEGORIES } from '../constants/Categories';

const CATEGORIES_STORAGE_KEY = 'user_defined_categories';

interface CategoriesContextType {
  categories: string[];
  addCategory: (newCategory: string) => void;
  removeCategory: (categoryToRemove: string) => void;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to load categories from storage', error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveCategories = async () => {
        try {
          await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        } catch (error) {
          console.error('Failed to save categories to storage', error);
        }
      };
      saveCategories();
    }
  }, [categories, isLoading]);

  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory) && newCategory.trim() !== '') {
      setCategories(prevCategories => [...prevCategories, newCategory.trim()]);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(prevCategories => prevCategories.filter(cat => cat !== categoryToRemove));
  };

  const value = {
    categories,
    addCategory,
    removeCategory,
    isLoading,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
