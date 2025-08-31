import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '85%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  currencySelector: { flexDirection: 'row', width: '100%', borderWidth: 1, borderColor: '#007bff', borderRadius: 10, overflow: 'hidden', marginBottom: 15 },
  currencyOption: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f0f4f7' },
  currencyOptionSelected: { backgroundColor: '#007bff' },
  currencyText: { fontSize: 16, color: '#007bff' },
  currencyTextSelected: { color: 'white', fontWeight: 'bold' },
  noteText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});