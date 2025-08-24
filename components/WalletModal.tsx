import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, Switch } from 'react-native';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: 'USD' | 'BS';
}

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (wallet: Omit<Wallet, 'id'>) => void;
  initialData?: Wallet | null;
}

export default function WalletModal({ isVisible, onClose, onSubmit, initialData }: WalletModalProps) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('0');
  const [isUSD, setIsUSD] = useState(true);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBalance(initialData.balance.toString());
      setIsUSD(initialData.currency === 'USD');
    } else {
      setName('');
      setBalance('0');
      setIsUSD(true);
    }
  }, [initialData, isVisible]);

  const handleSubmit = () => {
    const numericBalance = parseFloat(balance);
    if (!name || isNaN(numericBalance)) {
      alert('Por favor, ingresa un nombre y un saldo válidos.');
      return;
    }

    onSubmit({
      name,
      balance: numericBalance,
      currency: isUSD ? 'USD' : 'BS',
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar' : 'Añadir'} Billetera</Text>
            <TextInput style={styles.input} placeholder="Nombre de la billetera" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Saldo inicial" keyboardType="numeric" value={balance} onChangeText={setBalance} disabled={isEditing} />
            
            <View style={styles.switchContainer}>
              <Text style={styles.currencyText}>Bs.</Text>
              <Switch value={isUSD} onValueChange={setIsUSD} trackColor={{ false: '#767577', true: '#81b0ff' }} thumbColor={isUSD ? '#f5dd4b' : '#f4f3f4'} disabled={isEditing} />
              <Text style={styles.currencyText}>USD</Text>
            </View>
            {isEditing && <Text style={styles.noteText}>El saldo y la moneda no se pueden editar. Para ajustarlos, realiza ingresos o gastos.</Text>}

            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color="#ff5c5c" />
              <Button title={isEditing ? 'Guardar' : 'Añadir'} onPress={handleSubmit} />
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
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 10 },
  currencyText: { fontSize: 16 },
  noteText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});
