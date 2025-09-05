import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FixedExpense, Wallet, Category } from '../../types';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';
import { StyledInput } from '../ui/StyledInput';
import { HorizontalPicker } from '../ui/HorizontalPicker';

interface FixedExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  wallets: Wallet[];
  initialData?: FixedExpense | null;
}

export default function FixedExpenseModal({
  isVisible,
  onClose,
  onSubmit,
  wallets,
  initialData,
}: FixedExpenseModalProps) {
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VEF' | 'USDT'>('USD');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setDayOfMonth(initialData.dayOfMonth.toString());
        setCurrency(initialData.currency);
        setSelectedWalletId(initialData.walletId);
        setSelectedCategoryId(initialData.categoryId);
        setStartDate(initialData.startDate || '');
        setEndDate(initialData.endDate || '');
      } else {
        setName('');
        setAmount('');
        setDayOfMonth('');
        setCurrency('USD');
        setSelectedWalletId(wallets.length > 0 ? wallets[0].id : null);
        setSelectedCategoryId(expenseCategories.length > 0 ? expenseCategories[0].id : null);
        setStartDate('');
        setEndDate('');
      }
    }
  }, [initialData, isVisible, wallets, expenseCategories]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    const numericDay = parseInt(dayOfMonth, 10);

    if (
      !name ||
      !numericAmount ||
      !numericDay ||
      numericDay < 1 ||
      numericDay > 31 ||
      !selectedWalletId ||
      !selectedCategoryId
    ) {
      alert('Por favor, completa todos los campos obligatorios (Nombre, Monto, Día, Billetera y Categoría).');
      return;
    }

    onSubmit({
      name,
      amount: numericAmount,
      dayOfMonth: numericDay,
      currency: currency,
      walletId: selectedWalletId,
      categoryId: selectedCategoryId,
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
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{initialData ? 'Editar' : 'Añadir'} Gasto Fijo</Text>
              <StyledInput placeholder="Nombre (ej. Alquiler)" value={name} onChangeText={setName} />
              <StyledInput placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              <StyledInput
                placeholder="Día del Mes (1-31)"
                keyboardType="numeric"
                value={dayOfMonth}
                onChangeText={setDayOfMonth}
              />

              <View style={styles.currencySelector}>
                <TouchableOpacity
                  style={[styles.currencyOption, currency === 'VEF' && styles.currencyOptionSelected]}
                  onPress={() => setCurrency('VEF')}
                >
                  <Text style={[styles.currencyText, currency === 'VEF' && styles.currencyTextSelected]}>VEF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.currencyOption, currency === 'USD' && styles.currencyOptionSelected]}
                  onPress={() => setCurrency('USD')}
                >
                  <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextSelected]}>USD</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.currencyOption, currency === 'USDT' && styles.currencyOptionSelected]}
                  onPress={() => setCurrency('USDT')}
                >
                  <Text style={[styles.currencyText, currency === 'USDT' && styles.currencyTextSelected]}>USDT</Text>
                </TouchableOpacity>
              </View>

              <HorizontalPicker<Category>
                label="Categoría"
                data={expenseCategories}
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

              <HorizontalPicker<Wallet>
                label="Billetera de Pago"
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

              <Text style={styles.pickerLabel}>Periodo (Opcional)</Text>
              <StyledInput placeholder="Fecha de Inicio (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
              <StyledInput placeholder="Fecha de Fin (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
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
