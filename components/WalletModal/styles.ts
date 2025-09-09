import { StyleSheet } from 'react-native';

// Convert styles to a function that accepts theme colors
export const getStyles = (colors: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '85%',
      padding: 20,
      backgroundColor: colors.card, // Use theme color
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text, // Use theme color
    },
    currencySelector: {
      flexDirection: 'row',
      width: '100%',
      borderWidth: 1,
      borderColor: colors.primary, // Use theme color
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 15,
    },
    currencyOption: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.background, // Use theme color
    },
    currencyOptionSelected: {
      backgroundColor: colors.primary, // Use theme color
    },
    currencyText: {
      fontSize: 16,
      color: colors.primary, // Use theme color
    },
    currencyTextSelected: {
      color: colors.card, // Use a contrasting color (like the card background)
      fontWeight: 'bold',
    },
    noteText: {
      fontSize: 12,
      color: colors.text, // Use theme color
      textAlign: 'center',
      marginBottom: 20,
      fontStyle: 'italic',
      opacity: 0.7,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
  });
