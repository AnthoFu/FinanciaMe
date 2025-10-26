import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '85%', // Changed from 90% to 85%
      padding: 20,
      borderRadius: 10,
      backgroundColor: colors.card, // Added theme color
      // Removed elevation: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text, // Added theme color
    },
    input: {
      marginBottom: 15,
    },
    currencyContainer: {
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  });
