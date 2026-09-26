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
    typeSegment: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 25,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeTab: {
      paddingVertical: 6,
      paddingHorizontal: 18,
      borderRadius: 20,
    },
    typeTabActiveExpense: {
      backgroundColor: colors.notification,
    },
    typeTabActiveIncome: {
      backgroundColor: colors.primary,
    },
    typeTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      opacity: 0.7,
    },
    typeTabTextActive: {
      color: '#FFFFFF',
      opacity: 1,
      fontWeight: 'bold',
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
    // Hero Amount Section
    heroAmountCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
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
    // Section General
    section: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    sectionBadge: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
      opacity: 0.6,
    },
    // Wallet Selector
    walletScrollList: {
      gap: 10,
      paddingRight: 10,
    },
    walletCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 10,
    },
    walletCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    walletIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    walletIconCircleSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    walletName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    walletNameSelected: {
      color: colors.primary,
    },
    walletBalance: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.6,
      marginTop: 2,
    },
    walletBalanceSelected: {
      opacity: 0.9,
    },
    // Category Grid
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryCard: {
      width: '31%',
      backgroundColor: colors.card,
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    categoryCardSelectedExpense: {
      borderColor: colors.notification,
      backgroundColor: colors.card,
    },
    categoryCardSelectedIncome: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    categoryIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryIconCircleSelectedExpense: {
      backgroundColor: colors.notification,
      borderColor: colors.notification,
    },
    categoryIconCircleSelectedIncome: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    categoryNameSelectedExpense: {
      color: colors.notification,
      fontWeight: 'bold',
    },
    categoryNameSelectedIncome: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    // Date Row
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    dateQuickBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateQuickBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dateQuickText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    dateQuickTextActive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    datePickerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    datePickerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    // Footer Action Button
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
    },
    submitButtonExpense: {
      backgroundColor: colors.notification,
    },
    submitButtonIncome: {
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });
