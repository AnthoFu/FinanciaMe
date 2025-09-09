import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) =>
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
