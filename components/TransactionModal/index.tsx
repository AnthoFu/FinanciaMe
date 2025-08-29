import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView } from 'react-native';
import { Wallet } from '../../types';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, walletId: string, categoryId: string) => void;
  type: 'income' | 'expense';
  wallets: Wallet[];
  showToast: (message: string) => void;
  initialWalletId?: string | null;
}

export default function TransactionModal({ isVisible, onClose, onSubmit, type, wallets, showToast, initialWalletId }: TransactionModalProps) {
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

  useEffect(() => {
    if (isVisible) {
      setSelectedWalletId(initialWalletId || (wallets.length > 0 ? wallets[0].id : null));
      
      if (type === 'expense' && expenseCategories.length > 0) {
        setSelectedCategoryId(expenseCategories[0].id);
      } else if (type === 'income' && incomeCategories.length > 0) {
        setSelectedCategoryId(incomeCategories[0].id);
      }
    }
  }, [isVisible, initialWalletId, wallets, type, expenseCategories, incomeCategories]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !description || !selectedWalletId || !selectedCategoryId) {
      showToast('Por favor, completa todos los campos.');
      return;
    }
    onSubmit(numericAmount, description, selectedWalletId, selectedCategoryId);
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setSelectedWalletId(null);
    setSelectedCategoryId(null);
    onClose();
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const placeholderText = `Monto (${selectedWallet ? selectedWallet.currency : '...'})`;

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</Text>
              
              <Text style={styles.pickerLabel}>Billetera</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {wallets.map(wallet => (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.categoryItem, selectedWalletId === wallet.id && styles.categoryItemSelected]}
                    onPress={() => setSelectedWalletId(wallet.id)}
                  >
                    <Text style={[styles.categoryItemText, selectedWalletId === wallet.id && styles.categoryItemTextSelected]}>{wallet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.pickerLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {currentCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryItem, selectedCategoryId === category.id && styles.categoryItemSelected]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <IconSymbol name={category.icon} size={14} color={selectedCategoryId === category.id ? 'white' : '#007bff'} />
                    <Text style={[styles.categoryItemText, selectedCategoryId === category.id && styles.categoryItemTextSelected, {marginLeft: 5}]}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput style={styles.input} placeholder={placeholderText} keyboardType="numeric" value={amount} onChangeText={setAmount} />
              <TextInput style={styles.input} placeholder="Descripción" value={description} onChangeText={setDescription} />
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
