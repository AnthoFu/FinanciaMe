// hooks/useTheme.ts
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ColorTheme } from '../types';

export const useTheme = () => {
  const { colorScheme } = useAppTheme();
  const activeScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[activeScheme] as ColorTheme;

  return {
    dark: activeScheme === 'dark',
    colors,
  };
};
