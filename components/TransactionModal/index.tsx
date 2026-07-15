import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Keyboard,
  Modal,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
    commission?: number,
    date?: string,
  ) => void;
  type: 'income' | 'expense';
  wallets: Wallet[];
  initialWalletId?: string | null;
  transactionToEdit?: Transaction | null;
}

export default function TransactionModal({
  isVisible,
  onClose,
  onSubmit,
  type,
  wallets,
  initialWalletId,
  transactionToEdit,
}: TransactionModalProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const filteredWallets = useMemo(() => wallets.filter((w) => !w.isSavings), [wallets]);

  useEffect(() => {
    if (isVisible) {
      if (transactionToEdit) {
        setAmount(transactionToEdit.amount.toString());
        setCommission(transactionToEdit.commission ? transactionToEdit.commission.toString() : '');
        setDescription(transactionToEdit.description);
        setSelectedWalletId(transactionToEdit.walletId);
        setSelectedCategoryId(transactionToEdit.categoryId);
        setDate(new Date(transactionToEdit.date));
      } else {
        setSelectedWalletId(initialWalletId || (filteredWallets.length > 0 ? filteredWallets[0].id : null));
        const currentCats = type === 'expense' ? expenseCategories : incomeCategories;
        if (currentCats.length > 0) {
          setSelectedCategoryId(currentCats[0].id);
        } else {
          setSelectedCategoryId(null);
        }
        setDate(new Date());
      }
    }
  }, [isVisible, initialWalletId, filteredWallets, type, expenseCategories, incomeCategories, transactionToEdit]);

  const handleClose = useCallback(() => {
    setAmount('');
    setCommission('');
    setDescription('');
    setShowDatePicker(false);
    onClose();
  }, [onClose]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSubmit = useCallback(() => {
    const numericAmount = parseFloat(amount);
    const numericCommission = parseFloat(commission) || 0;
    if (!numericAmount || numericAmount <= 0 || !description || !selectedWalletId || !selectedCategoryId) {
      showToast({ message: 'Por favor, completa todos los campos.', type: 'error', position: 'top' });
      return;
    }
    onSubmit(
      numericAmount,
      description,
      selectedWalletId,
      selectedCategoryId,
      transactionToEdit ? transactionToEdit.type : type,
      transactionToEdit || undefined,
      numericCommission,
      date.toISOString(),
    );
    handleClose();
  }, [
    amount,
    commission,
    description,
    selectedWalletId,
    selectedCategoryId,
    onSubmit,
    transactionToEdit,
    type,
    date,
    showToast,
    handleClose,
  ]);

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

              <HorizontalPicker<Wallet, string>
                label="Billetera"
                data={filteredWallets}
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

              <HorizontalPicker<Category, string>
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

              <Text style={styles.fieldLabel}>Fecha</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <IconSymbol name="calendar" size={20} color={colors.primary} />
                <Text style={styles.datePickerButtonText}>
                  {date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              <StyledInput
                placeholder={placeholderText}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              {(transactionToEdit ? transactionToEdit.type === 'expense' : type === 'expense') && (
                <StyledInput
                  placeholder="Comisión (Opcional)"
                  keyboardType="numeric"
                  value={commission}
                  onChangeText={setCommission}
                />
              )}
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
