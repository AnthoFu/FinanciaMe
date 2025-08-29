import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '85%', maxHeight: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#f0f4f7', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  pickerLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start', marginTop: 10 },
  categoryScroll: { flexDirection: 'row', marginBottom: 15 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#007bff', marginRight: 8, backgroundColor: '#f0f4f7' },
  categoryItemSelected: { backgroundColor: '#007bff' },
  categoryItemText: { color: '#007bff', fontSize: 14 },
  categoryItemTextSelected: { color: 'white', fontWeight: 'bold' },
});
