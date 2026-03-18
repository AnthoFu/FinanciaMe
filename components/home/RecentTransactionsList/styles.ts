import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 25,
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    seeAllButtonText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text,
      opacity: 0.6,
      marginTop: 20,
      padding: 20,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 10,
      marginBottom: 10,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    transactionDetails: { flex: 1, justifyContent: 'center' },
    transactionDescription: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    transactionSubText: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.7,
    },
    transactionRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    incomeText: {
      color: '#28a745', // Keep green for income
      fontWeight: 'bold',
      fontSize: 15,
    },
    expenseText: {
      color: colors.notification, // Use notification color for expense
      fontWeight: 'bold',
      fontSize: 15,
    },
    incomeIconBackground: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)', // Lighter green
    },
    expenseIconBackground: {
      backgroundColor: 'rgba(220, 53, 69, 0.1)', // Lighter red
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: 4,
    },
    iconButton: {
      padding: 4,
      marginLeft: 8,
    },
  });
