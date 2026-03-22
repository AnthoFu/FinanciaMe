import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../types';
import { createMigratingStorage } from './persist-migration';

const CATEGORIES_STORAGE_KEY = 'user_defined_categories_v2';

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

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  addCategory: (name: string, icon: string, type: 'income' | 'expense') => void;
  removeCategory: (categoryId: string) => void;
  getCategoryById: (categoryId: string) => Category | undefined;
  setIsLoading: (loading: boolean) => void;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setCategories: (categories) => set({ categories }),

      addCategory: (name, icon, type) => {
        const newCategory: Category = {
          id: uuidv4(),
          name: name.trim(),
          icon,
          type,
        };
        if (name.trim() !== '') {
          set((state) => ({ categories: [...state.categories, newCategory] }));
        }
      },

      removeCategory: (categoryId) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== categoryId),
        }));
      },

      getCategoryById: (categoryId) => {
        return get().categories.find((cat) => cat.id === categoryId);
      },
    }),
    {
      name: CATEGORIES_STORAGE_KEY,
      storage: createMigratingStorage<CategoryState>('categories'),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migration and essential categories check
          let finalCategories = [...state.categories];
          let needsUpdate = false;

          // Ensure transfer categories exist
          if (!finalCategories.some((c) => c.id === 'transfer-in')) {
            finalCategories.push({
              id: 'transfer-in',
              name: 'Transferencia Entrante',
              icon: 'arrow.down.left.circle.fill',
              type: 'income',
            });
            needsUpdate = true;
          }
          if (!finalCategories.some((c) => c.id === 'transfer-out')) {
            finalCategories.push({
              id: 'transfer-out',
              name: 'Transferencia Saliente',
              icon: 'arrow.up.right.circle.fill',
              type: 'expense',
            });
            needsUpdate = true;
          }

          if (needsUpdate) {
            state.setCategories(finalCategories);
          }
          state.setIsLoading(false);
        }
      },
    },
  ),
);
