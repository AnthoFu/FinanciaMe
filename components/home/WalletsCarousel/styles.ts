import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text, // Themed
      marginBottom: 15,
      marginTop: 25,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text, // Themed
      opacity: 0.6,
      marginTop: 20,
      padding: 20,
      width: '100%',
    },
    walletsCarousel: { paddingHorizontal: 2, paddingBottom: 10 },
    walletCard: {
      backgroundColor: colors.card, // Themed
      borderRadius: 15,
      padding: 15,
      width: 180,
      marginRight: 15,
      justifyContent: 'space-between',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 3,
    },
    walletCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    walletCardName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text, // Themed
    },
    walletCardCurrency: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.card, // Themed
      backgroundColor: colors.primary, // Themed
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    walletCardBalance: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text, // Themed
      marginVertical: 10,
    },
    walletCardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    walletButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    incomeButton: {
      backgroundColor: colors.primary, // Themed, assuming primary is for positive actions
      opacity: 0.9,
    },
    expenseButton: {
      backgroundColor: colors.notification, // Themed, assuming notification is for negative actions
      opacity: 0.9,
    },
  });
