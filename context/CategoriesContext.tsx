import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types';

const CATEGORIES_STORAGE_KEY = 'user_defined_categories_v2';

// Categorías iniciales por defecto
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentación', icon: 'fork.knife' },
  { id: '2', name: 'Transporte', icon: 'car.fill' },
  { id: '3', name: 'Vivienda', icon: 'house.fill' },
  { id: '4', name: 'Entretenimiento', icon: 'gamecontroller.fill' },
  { id: '5', name: 'Salud', icon: 'heart.fill' },
  { id: '6', name: 'Educación', icon: 'book.fill' },
  { id: '7', name: 'Servicios', icon: 'wrench.and.screwdriver.fill' },
  { id: '8', name: 'Compras', icon: 'bag.fill' },
  { id: '9', name: 'Salario', icon: 'dollarsign.circle.fill' },
  { id: '10', name: 'Otros Ingresos', icon: 'plus.circle.fill' },
  { id: '11', name: 'Otros Gastos', icon: 'tag.fill' },
];

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, icon: string) => void;
  removeCategory: (categoryId: string) => void;
  getCategoryById: (categoryId: string) => Category | undefined;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
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

  const addCategory = (name: string, icon: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      icon,
    };
    if (name.trim() !== '') {
      setCategories(prevCategories => [...prevCategories, newCategory]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const value = {
    categories,
    addCategory,
    removeCategory,
    getCategoryById,
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
