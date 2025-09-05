import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Wallet, Category } from '../../types';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { StyledInput } from '../ui/StyledInput';
import { HorizontalPicker } from '../ui/HorizontalPicker';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, walletId: string, categoryId: string) => void;
  type: 'income' | 'expense';
  wallets: Wallet[];
  showToast: (message: string) => void;
  initialWalletId?: string | null;
}

export default function TransactionModal({
  isVisible,
  onClose,
  onSubmit,
  type,
  wallets,
  showToast,
  initialWalletId,
}: TransactionModalProps) {
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  useEffect(() => {
    if (isVisible) {
      setSelectedWalletId(initialWalletId || (wallets.length > 0 ? wallets[0].id : null));

      const currentCats = type === 'expense' ? expenseCategories : incomeCategories;
      if (currentCats.length > 0) {
        setSelectedCategoryId(currentCats[0].id);
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

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const placeholderText = `Monto (${selectedWallet ? selectedWallet.currency : '...'})`;

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</Text>

              <HorizontalPicker<Wallet>
                label="Billetera"
                data={wallets}
                selectedValue={selectedWalletId}
                onSelect={setSelectedWalletId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}>
                    <Text style={[styles.categoryItemText, isSelected && styles.categoryItemTextSelected]}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <HorizontalPicker<Category>
                label="Categoría"
                data={currentCategories}
                selectedValue={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}>
                    <IconSymbol name={item.icon as any} size={14} color={isSelected ? 'white' : '#007bff'} />
                    <Text
                      style={[
                        styles.categoryItemText,
                        isSelected && styles.categoryItemTextSelected,
                        { marginLeft: 5 },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <StyledInput
                placeholder={placeholderText}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <StyledInput placeholder="Descripción" value={description} onChangeText={setDescription} />
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
