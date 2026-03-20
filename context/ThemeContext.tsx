import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore, AppTheme, ColorScheme } from '../store/themeStore';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme() || 'light';
  const store = useThemeStore();

  const colorScheme = store.theme === 'system' ? systemColorScheme : store.theme;

  const value = useMemo(
    () => ({
      theme: store.theme,
      setTheme: store.setTheme,
      colorScheme,
    }),
    [store.theme, colorScheme, store.setTheme],
  );

  // Ya no retornamos null, dejamos que la app cargue con el tema por defecto
  // mientras Zustand hidrata el estado desde AsyncStorage.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('[useAppTheme] Error: useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
