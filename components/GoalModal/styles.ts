import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    topBarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    topBarRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    // Hero Amount Card
    heroAmountCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroAmountLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    heroAmountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCurrencyBadge: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.primary,
      marginRight: 8,
    },
    heroAmountInput: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
      minWidth: 120,
      textAlign: 'center',
      padding: 0,
    },
    // Sections
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    // Currency Selector Chips
    currencySelector: {
      flexDirection: 'row',
      gap: 10,
    },
    currencyChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    currencyChipSelected: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    currencyChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    currencyChipTextSelected: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    // Switch Card
    switchCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    switchSubtitle: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
      marginTop: 2,
    },
    // Footer
    footerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    submitButton: {
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });
