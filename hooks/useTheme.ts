// hooks/useTheme.ts
import { useTheme as useNativeTheme } from '@react-navigation/native';
import { ColorTheme } from '../types';

export const useTheme = () => {
  const theme = useNativeTheme();
  return theme as unknown as { colors: ColorTheme };
};
