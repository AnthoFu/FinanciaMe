import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Wallet } from './WalletModal';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: 'USD' | 'BS';
  dayOfMonth: number;
  walletId: string | null;
  lastPaid?: string;
  startDate?: string;
  endDate?: string;
}

interface FixedExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  wallets: Wallet[];
  initialData?: FixedExpense | null;
}

export default function FixedExpenseModal({ isVisible, onClose, onSubmit, wallets, initialData }: FixedExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'BS'>('USD');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setDayOfMonth(initialData.dayOfMonth.toString());
        setCurrency(initialData.currency);
        setSelectedWalletId(initialData.walletId);
        setStartDate(initialData.startDate || '');
        setEndDate(initialData.endDate || '');
      } else {
        setName('');
        setAmount('');
        setDayOfMonth('');
        setCurrency('USD');
        setSelectedWalletId(wallets.length > 0 ? wallets[0].id : null);
        setStartDate('');
        setEndDate('');
      }
    }
  }, [initialData, isVisible]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    const numericDay = parseInt(dayOfMonth, 10);

    if (!name || !numericAmount || !numericDay || numericDay < 1 || numericDay > 31 || !selectedWalletId) {
      alert('Por favor, completa los campos obligatorios (Nombre, Monto, Día, Billetera).');
      return;
    }

    onSubmit({
      name,
      amount: numericAmount,
      dayOfMonth: numericDay,
      currency: currency,
      walletId: selectedWalletId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{initialData ? 'Editar' : 'Añadir'} Gasto Fijo</Text>
              <TextInput style={styles.input} placeholder="Nombre (ej. Alquiler)" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              <TextInput style={styles.input} placeholder="Día del Mes (1-31)" keyboardType="numeric" value={dayOfMonth} onChangeText={setDayOfMonth} />
              
              <View style={styles.currencySelector}>
                <TouchableOpacity 
                  style={[styles.currencyOption, currency === 'BS' && styles.currencyOptionSelected]} 
                  onPress={() => setCurrency('BS')}
                >
                  <Text style={[styles.currencyText, currency === 'BS' && styles.currencyTextSelected]}>Bs.</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.currencyOption, currency === 'USD' && styles.currencyOptionSelected]} 
                  onPress={() => setCurrency('USD')}
                >
                  <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextSelected]}>USD</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.pickerLabel}>Billetera de Pago</Text>
              {wallets.map(wallet => (
                <TouchableOpacity 
                  key={wallet.id} 
                  style={[styles.pickerItem, selectedWalletId === wallet.id && styles.pickerItemSelected]}
                  onPress={() => setSelectedWalletId(wallet.id)}
                >
                  <Text style={styles.pickerItemText}>{wallet.name} ({wallet.currency})</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.pickerLabel}>Periodo (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Fecha de Inicio (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
              <TextInput style={styles.input} placeholder="Fecha de Fin (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color="#ff5c5c" />
              <Button title={initialData ? 'Guardar' : 'Añadir'} onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
