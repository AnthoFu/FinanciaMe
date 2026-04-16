import { StyleSheet, Dimensions } from 'react-native';
import { ColorTheme } from '../../../types';

const { width } = Dimensions.get('window');
// Card width at 70% of viewport width
const CARD_WIDTH = width * 0.7;
const CARD_SPACING = 12;
// Precise offset to center the card: (Screen Width - Card Width) / 2
const SIDE_OFFSET = (width - CARD_WIDTH) / 2;

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
      width: width,
      marginLeft: -20, // Perfectly counteract the parent's padding
    },
    carouselContainer: {
      paddingHorizontal: SIDE_OFFSET, // Centers the first and last card effectively
    },
    summaryCard: {
      width: CARD_WIDTH,
      borderRadius: 24,
      padding: 20,
      marginRight: CARD_SPACING,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      height: 210,
    },
    // Vibrant Orange-based palette
    cardGlobal: {
      backgroundColor: '#FF6F00',
    },
    cardVES: {
      backgroundColor: '#FF8F00',
    },
    cardUSD: {
      backgroundColor: '#FFA000',
    },
    cardUSDT: {
      backgroundColor: '#FFB300',
    },
    cardEUR: {
      backgroundColor: '#0055A4', // Azul Euro
    },
    summaryCardTitle: {
      color: 'white',
      fontSize: 11,
      fontWeight: '800',
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    summaryCardBalance: {
      color: 'white',
      fontSize: 28, // Slightly more compact balance
      fontWeight: 'bold',
      marginVertical: 4,
    },
    summaryRates: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.25)',
    },
    summaryRateText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    currencyCardContent: {
      flex: 1,
      justifyContent: 'center',
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
    },
    paginationDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.text,
      opacity: 0.15,
    },
    paginationDotActive: {
      width: 14,
      backgroundColor: '#0055A4', // Color de paginación activa igual al Euro o principal
      opacity: 1,
    },
  });
