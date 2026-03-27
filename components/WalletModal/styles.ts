import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    modalContent: {
      width: '90%',
      padding: 24,
      backgroundColor: colors.card,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: { 
      fontSize: 22, 
      fontWeight: '700', 
      marginBottom: 24, 
      textAlign: 'center', 
      color: colors.text 
    },
    section: {
      marginBottom: 16,
      width: '100%',
    },
    currencySelector: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      height: 46,
      width: '100%',
      marginTop: 8,
      backgroundColor: colors.background,
    },
    currencyOption: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    currencyOptionSelected: { 
      backgroundColor: colors.primary,
    },
    currencyText: { 
      fontSize: 14, 
      color: colors.text, 
      fontWeight: '500' 
    },
    currencyTextSelected: { 
      color: '#FFFFFF', 
      fontWeight: 'bold' 
    },
    noteText: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.6,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 16,
      lineHeight: 18,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      padding: 14,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    }
  });