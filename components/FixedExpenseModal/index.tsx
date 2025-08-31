import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ScrollView } from 'react-native';
import { FixedExpense, Wallet, Category } from '../../types';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../ui/IconSymbol';
import { styles } from './styles';

interface FixedExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  wallets: Wallet[];
  initialData?: FixedExpense | null;
}

export default function FixedExpenseModal({ isVisible, onClose, onSubmit, wallets, initialData }: FixedExpenseModalProps) {
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VEF' | 'USDT'>('USD');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

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

    if (!name || !numericAmount || !numericDay || numericDay < 1 || numericDay > 31 || !selectedWalletId || !selectedCategoryId) {
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
            <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{initialData ? 'Editar' : 'Añadir'} Gasto Fijo</Text>
              <TextInput style={styles.input} placeholder="Nombre (ej. Alquiler)" value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />
              <TextInput style={styles.input} placeholder="Día del Mes (1-31)" keyboardType="numeric" value={dayOfMonth} onChangeText={setDayOfMonth} />
              
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

              <Text style={styles.pickerLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {expenseCategories.map(category => (
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

              <Text style={styles.pickerLabel}>Billetera de Pago</Text>
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
