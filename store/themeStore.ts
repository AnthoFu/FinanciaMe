import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

export type ColorScheme = 'light' | 'dark';
export type AppTheme = ColorScheme | 'system';

interface ThemeState {
  theme: AppTheme;
  isLoading: boolean;
  setTheme: (theme: AppTheme) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_KEY,
      storage: createMigratingStorage<ThemeState>('theme'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
