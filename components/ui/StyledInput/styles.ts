import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    input: {
      width: '100%',
      backgroundColor: colors.background, // Use theme color
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border, // Use theme color
      fontSize: 16,
      color: colors.text, // Use theme color
    },
  });
