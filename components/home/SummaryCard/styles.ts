import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#1D3D47',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryCardTitle: { color: '#A9C4D4', fontSize: 14, fontWeight: '600' },
  summaryCardBalance: { color: 'white', fontSize: 40, fontWeight: 'bold', marginVertical: 8 },
  summaryRates: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, opacity: 0.8 },
  summaryRateText: { color: 'white', fontSize: 12 },
  summaryCurrencies: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  summaryCurrencyItem: { color: 'white', fontSize: 12, fontWeight: '500' },
});
