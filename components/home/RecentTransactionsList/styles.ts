import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
      marginTop: 25,
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
      padding: 12,
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
    incomeText: {
      color: '#28a745', // Keep green for income
      fontWeight: 'bold',
      fontSize: 16,
    },
    expenseText: {
      color: colors.notification, // Use notification color for expense
      fontWeight: 'bold',
      fontSize: 16,
    },
    incomeIconBackground: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)', // Lighter green
    },
    expenseIconBackground: {
      backgroundColor: 'rgba(220, 53, 69, 0.1)', // Lighter red
    },
    rightAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height: '85%',
      borderRadius: 10,
      marginHorizontal: 2,
    },
  });
