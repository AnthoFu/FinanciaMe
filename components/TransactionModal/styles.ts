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
      width: '85%',
      maxHeight: '80%',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 20,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
