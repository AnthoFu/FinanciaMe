import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => void;
  type: 'income' | 'expense';
}

export default function TransactionModal({ isVisible, onClose, onSubmit, type }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !description) {
      alert('Por favor, ingresa una descripción y un monto válido.');
      return;
    }
    onSubmit(numericAmount, description);
    setAmount('');
    setDescription('');
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    onClose();
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Monto (Bs.)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={handleClose} color="#ff5c5c" />
              <Button title="Aceptar" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#f0f4f7',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
