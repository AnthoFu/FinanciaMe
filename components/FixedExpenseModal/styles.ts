import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '85%', maxHeight: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#f0f4f7', padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  currencySelector: { flexDirection: 'row', width: '100%', borderWidth: 1, borderColor: '#007bff', borderRadius: 10, overflow: 'hidden', marginBottom: 15 },
  currencyOption: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f0f4f7' },
  currencyOptionSelected: { backgroundColor: '#007bff' },
  currencyText: { fontSize: 16, color: '#007bff' },
  currencyTextSelected: { color: 'white', fontWeight: 'bold' },
  pickerLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start', marginTop: 10 },
  pickerItem: { width: '100%', padding: 15, backgroundColor: '#f0f4f7', borderRadius: 10, marginBottom: 5, borderWidth: 1, borderColor: '#ddd' },
  pickerItemSelected: { borderColor: '#007bff', borderWidth: 2 },
  pickerItemText: { textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  categoryScroll: { flexDirection: 'row', marginBottom: 15 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#007bff', marginRight: 8, backgroundColor: '#f0f4f7' },
  categoryItemSelected: { backgroundColor: '#007bff' },
  categoryItemText: { color: '#007bff', fontSize: 14 },
  categoryItemTextSelected: { color: 'white', fontWeight: 'bold' },
});
