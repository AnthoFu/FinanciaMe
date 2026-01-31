import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    summaryCard: {
      backgroundColor: '#FF6F00', // Custom vibrant orange
      borderRadius: 20,
      padding: 20,
      shadowColor: 'black', // Use black for shadow
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, // Increased opacity for better visibility
      shadowRadius: 10,
      elevation: 5,
    },
    summaryCardTitle: {
      color: 'white', // White text
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.9, // Slightly increased opacity
    },
    summaryCardBalance: {
      color: 'white', // White text
      fontSize: 32,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    summaryRates: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      opacity: 0.9, // Slightly increased opacity
    },
    summaryRateText: {
      color: 'white', // White text
      fontSize: 11,
    },
    summaryCurrencies: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.4)', // Increased opacity for better visibility
      paddingTop: 12,
    },
    summaryCurrencyItem: {
      color: 'white', // White text
      fontSize: 12,
      fontWeight: '500',
    },
  });
