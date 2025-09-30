import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Category } from '../types';

const CATEGORIES_STORAGE_KEY = 'user_defined_categories_v2';

// Categorías iniciales por defecto
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentación', icon: 'fork.knife', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'car.fill', type: 'expense' },
  { id: '3', name: 'Vivienda', icon: 'house.fill', type: 'expense' },
  { id: '4', name: 'Entretenimiento', icon: 'gamecontroller.fill', type: 'expense' },
  { id: '5', name: 'Salud', icon: 'heart.fill', type: 'expense' },
  { id: '6', name: 'Educación', icon: 'book.fill', type: 'expense' },
  { id: '7', name: 'Servicios', icon: 'wrench.and.screwdriver.fill', type: 'expense' },
  { id: '8', name: 'Compras', icon: 'bag.fill', type: 'expense' },
  { id: '9', name: 'Salario', icon: 'dollarsign.circle.fill', type: 'income' },
  { id: '10', name: 'Otros Ingresos', icon: 'plus.circle.fill', type: 'income' },
  { id: '11', name: 'Otros Gastos', icon: 'tag.fill', type: 'expense' },
];

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, icon: string, type: 'income' | 'expense') => void;
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
        let finalCategories: Category[];

        if (storedCategories) {
          const parsedCategories = JSON.parse(storedCategories);
          let needsMigration = false;
          const migratedCategories = parsedCategories.map((cat: Category) => {
            if (!cat.type) {
              needsMigration = true;
              return {
                ...cat,
                type: cat.name === 'Salario' || cat.name === 'Otros Ingresos' ? 'income' : 'expense',
              };
            }
            return cat;
          });

          if (needsMigration) {
            await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(migratedCategories));
          }
          finalCategories = migratedCategories;
        } else {
          finalCategories = DEFAULT_CATEGORIES;
        }

        // Ensure transfer categories exist
        const transferInExists = finalCategories.some((c) => c.id === 'transfer-in');
        if (!transferInExists) {
          finalCategories.push({
            id: 'transfer-in',
            name: 'Transferencia Entrante',
            icon: 'arrow.down.left.circle.fill',
            type: 'income',
          });
        }

        const transferOutExists = finalCategories.some((c) => c.id === 'transfer-out');
        if (!transferOutExists) {
          finalCategories.push({
            id: 'transfer-out',
            name: 'Transferencia Saliente',
            icon: 'arrow.up.right.circle.fill',
            type: 'expense',
          });
        }

        setCategories(finalCategories);
      } catch (error) {
        console.error('[loadCategories] Fallo al intentar cargar las categorias del almacenamiento:', error);
        setCategories(DEFAULT_CATEGORIES); // Fallback to default
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
          console.error('[saveCategories] Fallo al intentar guardar las categorias al almacenamiento:', error);
        }
      };
      saveCategories();
    }
  }, [categories, isLoading]);

  const addCategory = (name: string, icon: string, type: 'income' | 'expense') => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      icon,
      type,
    };
    if (name.trim() !== '') {
      setCategories((prevCategories) => [...prevCategories, newCategory]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const value = {
    categories,
    addCategory,
    removeCategory,
    getCategoryById,
    isLoading,
  };

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('[useCategories] Error: useCategories debe utilizarse con un CategoriesProvider');
  }
  return context;
}
