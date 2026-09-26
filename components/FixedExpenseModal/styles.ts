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
    // Section General
    section: {
      marginBottom: 22,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    // Chips (Currency & Frequency)
    chipSelector: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    chipTextSelected: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    // Wallets Grid/Scroll
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
    // Category 3-Column Grid
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'flex-start',
    },
    categoryItem: {
      width: '31%',
      aspectRatio: 1.15,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
    },
    categoryItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    categoryIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      backgroundColor: colors.background,
    },
    categoryIconCircleSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    categoryName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    categoryNameSelected: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    // Dates
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      width: '100%',
    },
    dateTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
    },
    dateTriggerText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 10,
    },
    clearButton: {
      width: 44,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });
