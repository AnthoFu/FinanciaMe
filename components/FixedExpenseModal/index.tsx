import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { FixedExpense, Wallet, Category, ExpenseFrequency } from '../../types';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../ui/IconSymbol';
import { getStyles } from './styles';
import { StyledInput } from '../ui/StyledInput';
import { HorizontalPicker } from '../ui/HorizontalPicker';

interface FixedExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<FixedExpense, 'id' | 'lastPaid'>) => void;
  wallets: Wallet[];
  initialData?: FixedExpense | null;
}

const frequencyOptions: { label: string; value: ExpenseFrequency }[] = [
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Quincenal', value: 'biweekly' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
];

export default function FixedExpenseModal({
  isVisible,
  onClose,
  onSubmit,
  wallets,
  initialData,
}: FixedExpenseModalProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT' | 'EUR'>('USD');
  const [frequency, setFrequency] = useState<ExpenseFrequency>('monthly');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setFrequency(initialData.frequency);
        setDayOfMonth(initialData.dayOfMonth?.toString() || '');
        setCurrency(initialData.currency);
        setSelectedWalletId(initialData.walletId);
        setSelectedCategoryId(initialData.categoryId);
        setStartDate(initialData.startDate ? new Date(initialData.startDate) : undefined);
        setEndDate(initialData.endDate ? new Date(initialData.endDate) : undefined);
      } else {
        setName('');
        setAmount('');
        setDayOfMonth('');
        setFrequency('monthly');
        setCurrency('USD');
        setSelectedWalletId(wallets.length > 0 ? wallets[0].id : null);
        setSelectedCategoryId(expenseCategories.length > 0 ? expenseCategories[0].id : null);
        setStartDate(undefined);
        setEndDate(undefined);
      }
    }
  }, [initialData, isVisible, wallets, expenseCategories]);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    const numericDay = parseInt(dayOfMonth, 10);

    if (!name || !numericAmount || !selectedWalletId || !selectedCategoryId) {
      showToast({ message: 'Por favor, completa los campos obligatorios.', type: 'error', position: 'top' });
      return;
    }

    if (frequency === 'monthly' && (!numericDay || numericDay < 1 || numericDay > 31)) {
      showToast({ message: 'Por favor, introduce un día del mes válido (1-31).', type: 'error', position: 'top' });
      return;
    }

    onSubmit({
      name,
      amount: numericAmount,
      frequency,
      dayOfMonth: frequency === 'monthly' ? numericDay : undefined,
      currency: currency,
      walletId: selectedWalletId,
      categoryId: selectedCategoryId,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    });
    onClose();
  };

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No definida';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{initialData ? 'Editar' : 'Añadir'} Gasto Fijo</Text>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              indicatorStyle={colors.text === '#FFFFFF' ? 'white' : 'black'}
            >
              <View style={styles.section}>
                <StyledInput placeholder="Nombre (ej. Alquiler)" value={name} onChangeText={setName} />

                <StyledInput placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />

                <View style={styles.currencySelector}>
                  {(['VES', 'USD', 'USDT', 'EUR'] as const).map((curr) => (
                    <TouchableOpacity
                      key={curr}
                      style={[styles.currencyOption, currency === curr && styles.currencyOptionSelected]}
                      onPress={() => setCurrency(curr)}
                    >
                      <Text style={[styles.currencyText, currency === curr && styles.currencyTextSelected]}>
                        {curr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <HorizontalPicker<(typeof frequencyOptions)[0], ExpenseFrequency>
                  label="Frecuencia"
                  data={frequencyOptions}
                  selectedValue={frequency}
                  onSelect={setFrequency}
                  keyExtractor={(item) => item.value}
                  renderItem={(item, isSelected) => (
                    <View style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}>
                      <Text style={[styles.categoryItemText, isSelected && styles.categoryItemTextSelected]}>
                        {item.label}
                      </Text>
                    </View>
                  )}
                />

                {frequency === 'monthly' && (
                  <StyledInput
                    placeholder="Día del Mes (1-31)"
                    keyboardType="numeric"
                    value={dayOfMonth}
                    onChangeText={setDayOfMonth}
                  />
                )}
              </View>

              <HorizontalPicker<Category, string>
                label="Categoría"
                data={expenseCategories}
                selectedValue={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}>
                    <IconSymbol name={item.icon as any} size={14} color={isSelected ? '#FFFFFF' : colors.primary} />
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

              <HorizontalPicker<Wallet, string>
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

              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateTrigger} onPress={() => setShowStartDatePicker(true)}>
                  <IconSymbol name="calendar" size={18} color={colors.primary} />
                  <Text style={styles.dateTriggerText} numberOfLines={1}>
                    Desde: {formatDate(startDate)}
                  </Text>
                </TouchableOpacity>
                {startDate && (
                  <TouchableOpacity style={styles.clearButton} onPress={() => setStartDate(undefined)}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.notification} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateTrigger} onPress={() => setShowEndDatePicker(true)}>
                  <IconSymbol name="calendar" size={18} color={colors.primary} />
                  <Text style={styles.dateTriggerText} numberOfLines={1}>
                    Hasta: {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>
                {endDate && (
                  <TouchableOpacity style={styles.clearButton} onPress={() => setEndDate(undefined)}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.notification} />
                  </TouchableOpacity>
                )}
              </View>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                />
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={onClose}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
                onPress={handleSubmit}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                  {initialData ? 'Guardar' : 'Añadir'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
