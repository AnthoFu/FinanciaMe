import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Keyboard, Modal, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
import { Category, Transaction, Wallet } from '../../types';
import { HorizontalPicker } from '../ui/HorizontalPicker';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (
    amount: number,
    description: string,
    walletId: string,
    categoryId: string,
    type: 'income' | 'expense',
    transactionToEdit?: Transaction,
  ) => void;
  type: 'income' | 'expense';
  wallets: Wallet[];
  showToast: (message: string) => void;
  initialWalletId?: string | null;
  transactionToEdit?: Transaction | null;
}

export default function TransactionModal({
  isVisible,
  onClose,
  onSubmit,
  type,
  wallets,
  showToast,
  initialWalletId,
  transactionToEdit,
}: TransactionModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  useEffect(() => {
    if (isVisible) {
      if (transactionToEdit) {
        setAmount(transactionToEdit.amount.toString());
        setDescription(transactionToEdit.description);
        setSelectedWalletId(transactionToEdit.walletId);
        setSelectedCategoryId(transactionToEdit.categoryId);
      } else {
        setSelectedWalletId(initialWalletId || (wallets.length > 0 ? wallets[0].id : null));
        const currentCats = type === 'expense' ? expenseCategories : incomeCategories;
        if (currentCats.length > 0) {
          setSelectedCategoryId(currentCats[0].id);
        } else {
          setSelectedCategoryId(null);
        }
      }
    }
  }, [isVisible, initialWalletId, wallets, type, expenseCategories, incomeCategories, transactionToEdit]);

  // Memoizar las funciones de manejo
  const handleSubmit = useCallback(() => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !description || !selectedWalletId || !selectedCategoryId) {
      showToast('Por favor, completa todos los campos.');
      return;
    }
    onSubmit(
      numericAmount,
      description,
      selectedWalletId,
      selectedCategoryId,
      transactionToEdit ? transactionToEdit.type : type,
      transactionToEdit || undefined,
    );
    handleClose();
  }, [
    amount,
    description,
    selectedWalletId,
    selectedCategoryId,
    onSubmit,
    transactionToEdit,
    type,
    showToast,
    handleClose,
  ]);

  const handleClose = useCallback(() => {
    setAmount('');
    setDescription('');
    // Do not reset wallet/category to provide a better UX
    onClose();
  }, [onClose]);

  // Memoizar cálculos costosos
  const selectedWallet = useMemo(() => wallets.find((w) => w.id === selectedWalletId), [wallets, selectedWalletId]);

  const placeholderText = useMemo(
    () => `Monto (${selectedWallet ? selectedWallet.currency : '...'})`,
    [selectedWallet],
  );

  const currentCategories = useMemo(
    () =>
      transactionToEdit
        ? transactionToEdit.type === 'expense'
          ? expenseCategories
          : incomeCategories
        : type === 'expense'
          ? expenseCategories
          : incomeCategories,
    [transactionToEdit, expenseCategories, incomeCategories, type],
  );

  const modalTitle = useMemo(
    () => (transactionToEdit ? 'Editar Movimiento' : type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'),
    [transactionToEdit, type],
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>

              <HorizontalPicker<Wallet>
                label="Billetera"
                data={wallets}
                selectedValue={selectedWalletId}
                onSelect={setSelectedWalletId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
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
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <IconSymbol name={item.icon as any} size={14} color={isSelected ? colors.card : colors.primary} />
                    <Text
                      style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected, { marginLeft: 5 }]}
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
              <Button title="Cancelar" onPress={handleClose} color={colors.notification} />
              <Button title={transactionToEdit ? 'Guardar' : 'Aceptar'} onPress={handleSubmit} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
