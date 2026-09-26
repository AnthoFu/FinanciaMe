import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { useCategories } from '../../context/CategoriesContext';
import { ExpenseFrequency, FixedExpense, Wallet } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

const currencyOptions: ('USD' | 'VES' | 'USDT' | 'EUR')[] = ['USD', 'VES', 'USDT', 'EUR'];

function FixedExpenseFormContent({
  onClose,
  onSubmit,
  wallets,
  initialData,
}: Omit<FixedExpenseModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { categories } = useCategories();

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const [name, setName] = useState(initialData ? initialData.name : '');
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.dayOfMonth?.toString() || '');
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT' | 'EUR'>(initialData ? initialData.currency : 'USD');
  const [frequency, setFrequency] = useState<ExpenseFrequency>(initialData ? initialData.frequency : 'monthly');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    initialData ? initialData.walletId : wallets.length > 0 ? wallets[0].id : null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    if (initialData) return initialData.categoryId;
    return expenseCategories.length > 0 ? expenseCategories[0].id : null;
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  );

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    const numericDay = parseInt(dayOfMonth, 10);

    if (!name.trim()) {
      showToast({ message: 'Por favor, introduce el nombre del gasto fijo.', type: 'error' });
      return;
    }
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      showToast({ message: 'Por favor, introduce un monto válido mayor a cero.', type: 'error' });
      return;
    }
    if (!selectedWalletId) {
      showToast({ message: 'Por favor, selecciona una billetera de pago.', type: 'error' });
      return;
    }
    if (!selectedCategoryId) {
      showToast({ message: 'Por favor, selecciona una categoría.', type: 'error' });
      return;
    }
    if (frequency === 'monthly' && (!numericDay || numericDay < 1 || numericDay > 31)) {
      showToast({
        message: 'Por favor, introduce un día del mes válido (1-31).',
        type: 'error',
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      amount: numericAmount,
      frequency,
      dayOfMonth: frequency === 'monthly' ? numericDay : undefined,
      currency,
      walletId: selectedWalletId,
      categoryId: selectedCategoryId,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    });
    onClose();
  };

  const onStartDateValueChange = (_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateValueChange = (_event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No definida';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{initialData ? 'Editar Gasto Fijo' : 'Añadir Gasto Fijo'}</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Amount Card */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>Monto del Gasto Fijo</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencyBadge}>{currencySymbol}</Text>
                <TextInput
                  style={styles.heroAmountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 2. Nombre del Gasto Fijo */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nombre del servicio / gasto</Text>
            <StyledInput
              placeholder="Ej. Alquiler, Netflix, Internet, Gimnasio..."
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 3. Moneda */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Moneda</Text>
            <View style={styles.chipSelector}>
              {currencyOptions.map((curr) => {
                const isSelected = currency === curr;
                return (
                  <TouchableOpacity
                    key={curr}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setCurrency(curr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{curr}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Frecuencia y Día de Pago */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Frecuencia de Pago</Text>
            <View style={styles.chipSelector}>
              {frequencyOptions.map((opt) => {
                const isSelected = frequency === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setFrequency(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {frequency === 'monthly' && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                  Día del Mes para Pago (1 - 31)
                </Text>
                <StyledInput
                  placeholder="Ej. 15"
                  keyboardType="number-pad"
                  value={dayOfMonth}
                  onChangeText={setDayOfMonth}
                />
              </View>
            )}
          </View>

          {/* 5. Período Opcional (Desde / Hasta) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Período de Validez (Opcional)</Text>

            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateTrigger}
                onPress={() => setShowStartDatePicker(true)}
                activeOpacity={0.7}
              >
                <IconSymbol name="calendar" size={18} color={colors.primary} />
                <Text style={styles.dateTriggerText} numberOfLines={1}>
                  Desde: {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
              {startDate && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setStartDate(undefined)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.notification} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateTrigger}
                onPress={() => setShowEndDatePicker(true)}
                activeOpacity={0.7}
              >
                <IconSymbol name="calendar" size={18} color={colors.primary} />
                <Text style={styles.dateTriggerText} numberOfLines={1}>
                  Hasta: {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
              {endDate && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setEndDate(undefined)} activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.notification} />
                </TouchableOpacity>
              )}
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onStartDateValueChange}
                onDismiss={() => setShowStartDatePicker(false)}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onEndDateValueChange}
                onDismiss={() => setShowEndDatePicker(false)}
              />
            )}
          </View>

          {/* 6. Billetera de Pago */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Billetera de Pago Predeterminada</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletScrollList}
            >
              {wallets.map((wallet) => {
                const isSelected = wallet.id === selectedWalletId;
                const currSymbol = CURRENCY_SYMBOLS[wallet.currency] || wallet.currency;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletCard, isSelected && styles.walletCardSelected]}
                    onPress={() => setSelectedWalletId(wallet.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.walletIconCircle, isSelected && styles.walletIconCircleSelected]}>
                      <IconSymbol name="wallet.pass.fill" size={16} color={isSelected ? '#FFFFFF' : colors.text} />
                    </View>
                    <View>
                      <Text style={[styles.walletName, isSelected && styles.walletNameSelected]}>{wallet.name}</Text>
                      <Text style={[styles.walletBalance, isSelected && styles.walletBalanceSelected]}>
                        {currSymbol} {wallet.balance.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 7. Categoría (Abajo del todo) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categoría Asociada</Text>
            <View style={styles.categoryGrid}>
              {expenseCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryIconCircle, isSelected && styles.categoryIconCircleSelected]}>
                      <IconSymbol name={cat.icon as any} size={18} color={isSelected ? '#FFFFFF' : colors.text} />
                    </View>
                    <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>{initialData ? 'Guardar Cambios' : 'Añadir Gasto Fijo'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function FixedExpenseModal(props: FixedExpenseModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.initialData ? `edit-fixed-${props.initialData.id}` : 'new-fixed';

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <FixedExpenseFormContent key={formKey} {...props} />
    </Modal>
  );
}
