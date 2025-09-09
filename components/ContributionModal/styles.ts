import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) =>
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
    pickerLabel: {
      fontSize: 16,
      marginBottom: 10,
      color: colors.text, // Added theme color
    },
    walletContainer: {
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  });
