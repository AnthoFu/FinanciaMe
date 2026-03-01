import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { THEME_KEY } from '../constants/StorageKeys';

export type ColorScheme = 'light' | 'dark';
export type AppTheme = ColorScheme | 'system';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme() || 'light';
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      try {
        const storedTheme = (await AsyncStorage.getItem(THEME_KEY)) as AppTheme | null;
        if (storedTheme) {
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.error('[loadTheme] Error loading theme from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (!isLoading) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
          console.error('[saveTheme] Error saving theme to storage:', error);
        }
      };
      saveTheme();
    }
  };

  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      colorScheme,
    }),
    [theme, colorScheme],
  );

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('[useAppTheme] Error: useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
