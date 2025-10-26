import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    pickerLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      alignSelf: 'flex-start',
      marginTop: 10,
      color: colors.text, // Themed
    },
    scrollView: {
      flexDirection: 'row',
      marginBottom: 15,
    },
  });
