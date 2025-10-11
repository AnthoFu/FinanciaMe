import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
    },
    timeRangeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 5,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    timeRangeButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    timeRangeButtonSelected: {
      backgroundColor: colors.primary,
    },
    timeRangeButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    timeRangeButtonTextSelected: {
      color: colors.card,
      fontWeight: 'bold',
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    summaryCard: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    summaryTitle: {
      fontSize: 18,
      color: colors.text,
      opacity: 0.7,
      marginBottom: 5,
    },
    summaryAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.notification, // Use notification for total spending (often red)
    },
    incomeAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary, // Use primary for total income
    },
    netFlowAmountPositive: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#28a745', // A standard green color for positive values
    },
    netFlowAmountNegative: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.notification, // Use notification for negative values (often red)
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 10,
      marginBottom: 10,
      alignSelf: 'flex-start',
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    categoryName: {
      fontSize: 16,
      color: colors.text,
    },
    categoryAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.notification, // Use notification for expense amount
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      color: colors.text,
      opacity: 0.6,
    },
  });
