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
      width: '90%',
      padding: 20,
      borderRadius: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      marginBottom: 15,
    },
    pickerContainer: {
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      marginRight: 8,
      backgroundColor: colors.background,
    },
    pickerItemSelected: {
      backgroundColor: colors.primary,
    },
    pickerItemText: {
      color: colors.primary,
      fontSize: 14,
    },
    pickerItemTextSelected: {
      color: colors.card, // Contrasting color
      fontWeight: 'bold',
    },
  });
