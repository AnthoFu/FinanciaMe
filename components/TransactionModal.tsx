import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView } from 'react-native';
import { Wallet } from '../types'; // Import Wallet type
import { useCategories } from '../hooks/useCategories'; // Import useCategories hook

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, walletId: string, category?: string) => void; // onSubmit now returns category
  type: 'income' | 'expense';
  wallets: Wallet[];
  showToast: (message: string) => void;
  initialWalletId?: string | null;
}

export default function TransactionModal({ isVisible, onClose, onSubmit, type, wallets, showToast, initialWalletId }: TransactionModalProps) {
  const { categories, isLoading: categoriesLoading } = useCategories(); // Use categories hook
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // New state for category

  useEffect(() => {
    if (isVisible) {
      if (initialWalletId) { // Prioritize initialWalletId if provided
        setSelectedWalletId(initialWalletId);
      } else if (wallets.length > 0 && !selectedWalletId) { // Fallback to first wallet
        setSelectedWalletId(wallets[0].id);
      }
      // Set default category for expenses
      if (type === 'expense' && !selectedCategory && categories.length > 0) {
        setSelectedCategory(categories.filter(cat => cat !== "Salario" && cat !== "Otros Ingresos")[0]); // Default to first expense category
      } else if (type === 'income' && !selectedCategory && categories.length > 0) {
        setSelectedCategory(categories.find(cat => cat === "Salario") || categories[0]); // Default to Salario for income, or first category
      }
    }
  }, [isVisible, wallets, selectedWalletId, initialWalletId, type, selectedCategory]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !description || !selectedWalletId || (type === 'expense' && !selectedCategory)) {
      showToast('Por favor, ingresa un monto, descripción, selecciona una billetera y una categoría.');
      return;
    }
    onSubmit(numericAmount, description, selectedWalletId, selectedCategory || undefined); // Pass selectedWalletId and category
    setAmount('');
    setDescription('');
    setSelectedWalletId(null); // Reset selected wallet
    setSelectedCategory(null); // Reset selected category
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setSelectedWalletId(null);
    setSelectedCategory(null); // Reset selected category
    onClose();
  }

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const placeholderText = `Monto (${selectedWallet ? (selectedWallet.currency === 'USD' ? '$' : 'Bs.') : 'Bs.'})`; // Dynamic placeholder based on selected wallet

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
            <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</Text>
              
              <Text style={styles.pickerLabel}>Seleccionar Billetera</Text>
              {wallets.map(wallet => (
                <TouchableOpacity 
                  key={wallet.id} 
                  style={[styles.pickerItem, selectedWalletId === wallet.id && styles.pickerItemSelected]}
                  onPress={() => setSelectedWalletId(wallet.id)}
                >
                  <Text style={styles.pickerItemText}>{wallet.name} ({wallet.currency})</Text>
                </TouchableOpacity>
              ))}

              {type === 'expense' && ( // Only show category picker for expenses
                <>
                  <Text style={styles.pickerLabel}>Categoría</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.filter(cat => cat !== "Salario" && cat !== "Otros Ingresos").map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[styles.categoryItem, selectedCategory === category && styles.categoryItemSelected]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={[styles.categoryItemText, selectedCategory === category && styles.categoryItemTextSelected]}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder={placeholderText}
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
            </ScrollView>
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
    width: '85%', // Adjusted width for better appearance
    maxHeight: '80%', // Added max height for scrollability
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
    marginTop: 20, // Added margin top
    paddingTop: 10, // Added padding top
    borderTopWidth: 1, // Added border top
    borderTopColor: '#eee', // Added border color
  },
  // New styles for wallet picker
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  pickerItem: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f4f7',
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerItemSelected: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  pickerItemText: {
    textAlign: 'center',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    marginRight: 8,
    backgroundColor: '#f0f4f7',
  },
  categoryItemSelected: {
    backgroundColor: '#007bff',
  },
  categoryItemText: {
    color: '#007bff',
    fontSize: 14,
  },
  categoryItemTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});