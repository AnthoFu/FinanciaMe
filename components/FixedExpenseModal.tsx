import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, Switch } from 'react-native';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: 'USD' | 'BS';
  dayOfMonth: number;
  lastPaid?: string; // ISO date string
}

interface FixedExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  initialData?: FixedExpense | null;
}

export default function FixedExpenseModal({ isVisible, onClose, onSubmit, initialData }: FixedExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [isUSD, setIsUSD] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount.toString());
      setDayOfMonth(initialData.dayOfMonth.toString());
      setIsUSD(initialData.currency === 'USD');
    } else {
      // Reset form when opening for a new expense
      setName('');
      setAmount('');
      setDayOfMonth('');
      setIsUSD(true);
    }
  }, [initialData, isVisible]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    const numericDay = parseInt(dayOfMonth, 10);

    if (!name || !numericAmount || !numericDay || numericDay < 1 || numericDay > 31) {
      alert('Por favor, completa todos los campos con valores válidos.');
      return;
    }

    onSubmit({
      name,
      amount: numericAmount,
      dayOfMonth: numericDay,
      currency: isUSD ? 'USD' : 'BS',
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{initialData ? 'Editar' : 'Añadir'} Gasto Fijo</Text>
            <TextInput style={styles.input} placeholder="Nombre (ej. Alquiler)" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TextInput style={styles.input} placeholder="Día del Mes (1-31)" keyboardType="numeric" value={dayOfMonth} onChangeText={setDayOfMonth} />
            
            <View style={styles.switchContainer}>
              <Text>Bs.</Text>
              <Switch value={isUSD} onValueChange={setIsUSD} trackColor={{ false: '#767577', true: '#81b0ff' }} thumbColor={isUSD ? '#f5dd4b' : '#f4f3f4'} />
              <Text>USD</Text>
            </View>

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
  modalContent: { width: '85%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#f0f4f7', padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});
