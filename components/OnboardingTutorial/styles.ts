import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../types';

export const getOnboardingStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    tutorialContent: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
    contentTop: {
      justifyContent: 'flex-start',
      paddingTop: 60,
    },
    contentBottom: {
      justifyContent: 'flex-end',
      paddingBottom: 150, // Más espacio para no tapar el spotlight circular
    },
    stepContainer: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    stepDescription: {
      fontSize: 17,
      color: colors.text,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 30,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
    },
    progressDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginHorizontal: 5,
    },
    progressDotActive: {
      backgroundColor: colors.tint,
      width: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    skipButtonText: {
      color: colors.text,
      opacity: 0.5,
      fontSize: 16,
      fontWeight: '500',
    },
    navigationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    button: {
      height: 52,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    secondaryButton: {
      backgroundColor: colors.border,
      width: 52, // Botón cuadrado para atrás
      paddingHorizontal: 0,
    },
    primaryButton: {
      backgroundColor: colors.tint,
      minWidth: 130,
    },
    primaryButtonText: {
      color: colors.primaryButtonText,
      fontSize: 16,
      fontWeight: '700',
      marginRight: 6,
    },
  });
