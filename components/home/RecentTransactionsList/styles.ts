import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3D47', marginBottom: 15, marginTop: 25 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20, padding: 20 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
  transactionDescription: { fontSize: 15, fontWeight: '500', color: '#1D3D47' },
  transactionSubText: { fontSize: 12, color: '#666' },
  incomeText: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
  expenseText: { color: '#dc3545', fontWeight: 'bold', fontSize: 16 },
});
