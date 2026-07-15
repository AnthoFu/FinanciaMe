import { StyleSheet } from 'react-native';
import { ColorTheme } from '@/types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      width: '85%',
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    button: {
      flex: 1,
      height: 50,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    destructiveButton: {
      backgroundColor: colors.notification,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
  });
