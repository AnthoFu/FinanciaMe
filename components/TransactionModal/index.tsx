import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useCallback, useMemo, useState } from 'react';
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
import { Transaction, Wallet } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

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

function TransactionFormContent({
  onClose,
  onSubmit,
  type,
  wallets,
  initialWalletId,
  transactionToEdit,
}: Omit<TransactionModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { categories } = useCategories();

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);
  const filteredWallets = useMemo(() => wallets.filter((w) => !w.isSavings), [wallets]);

  const [currentType, setCurrentType] = useState<'income' | 'expense'>(
    transactionToEdit ? transactionToEdit.type : type,
  );
  const [amount, setAmount] = useState(transactionToEdit ? transactionToEdit.amount.toString() : '');
  const [commission, setCommission] = useState(
    transactionToEdit?.commission ? transactionToEdit.commission.toString() : '',
  );
  const [description, setDescription] = useState(transactionToEdit ? transactionToEdit.description : '');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    transactionToEdit
      ? transactionToEdit.walletId
      : initialWalletId || (filteredWallets.length > 0 ? filteredWallets[0].id : null),
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    if (transactionToEdit) return transactionToEdit.categoryId;
    const initialCats = type === 'expense' ? expenseCategories : incomeCategories;
    return initialCats.length > 0 ? initialCats[0].id : null;
  });
  const [date, setDate] = useState(transactionToEdit ? new Date(transactionToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentCategories = useMemo(
    () => (currentType === 'expense' ? expenseCategories : incomeCategories),
    [currentType, expenseCategories, incomeCategories],
  );

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setCurrentType(newType);
    const relevantCats = newType === 'expense' ? expenseCategories : incomeCategories;
    if (relevantCats.length > 0 && (!selectedCategoryId || !relevantCats.some((c) => c.id === selectedCategoryId))) {
      setSelectedCategoryId(relevantCats[0].id);
    }
  };

  const handleClose = useCallback(() => {
    setShowDatePicker(false);
    onClose();
  }, [onClose]);

  const onDateValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const isToday = useMemo(() => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date]);

  const isYesterday = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }, [date]);

  const setTodayDate = () => setDate(new Date());
  const setYesterdayDate = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setDate(y);
  };

  const selectedWallet = useMemo(() => wallets.find((w) => w.id === selectedWalletId), [wallets, selectedWalletId]);
  const currencySymbol = useMemo(
    () => (selectedWallet ? CURRENCY_SYMBOLS[selectedWallet.currency] || selectedWallet.currency : '$'),
    [selectedWallet],
  );

  const handleSubmit = useCallback(() => {
    const numericAmount = parseFloat(amount);
    const numericCommission = parseFloat(commission) || 0;
    if (!numericAmount || numericAmount <= 0) {
      showToast({ message: 'Por favor, ingresa un monto válido mayor a 0.', type: 'error', position: 'top' });
      return;
    }
    if (!description.trim()) {
      showToast({ message: 'Por favor, ingresa una descripción.', type: 'error', position: 'top' });
      return;
    }
    if (!selectedWalletId) {
      showToast({ message: 'Por favor, selecciona una billetera.', type: 'error', position: 'top' });
      return;
    }
    if (!selectedCategoryId) {
      showToast({ message: 'Por favor, selecciona una categoría.', type: 'error', position: 'top' });
      return;
    }

    onSubmit(
      numericAmount,
      description.trim(),
      selectedWalletId,
      selectedCategoryId,
      currentType,
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
    currentType,
    onSubmit,
    transactionToEdit,
    date,
    showToast,
    handleClose,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
        {/* Barra Superior */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.typeSegment}>
            <TouchableOpacity
              style={[styles.typeTab, currentType === 'expense' && styles.typeTabActiveExpense]}
              onPress={() => handleTypeChange('expense')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeTabText, currentType === 'expense' && styles.typeTabTextActive]}>Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, currentType === 'income' && styles.typeTabActiveIncome]}
              onPress={() => handleTypeChange('income')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeTabText, currentType === 'income' && styles.typeTabTextActive]}>Ingreso</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Monto Principal */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>
                {currentType === 'expense' ? 'Monto a Gastar' : 'Monto a Ingresar'}
              </Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencyBadge}>{currencySymbol}</Text>
                <TextInput
                  style={styles.heroAmountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.icon || 'rgba(150, 150, 150, 0.4)'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  selectionColor={colors.primary}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 2. Descripción / Concepto (Campo Obligatorio) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción / Concepto</Text>
            <StyledInput
              placeholder="Ej. Almuerzo, Supermercado, etc."
              value={description}
              onChangeText={setDescription}
              returnKeyType="next"
            />
          </View>

          {/* 3. Selector de Fecha */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fecha</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateQuickBtn, isToday && styles.dateQuickBtnActive]}
                onPress={setTodayDate}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateQuickText, isToday && styles.dateQuickTextActive]}>Hoy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateQuickBtn, isYesterday && styles.dateQuickBtnActive]}
                onPress={setYesterdayDate}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateQuickText, isYesterday && styles.dateQuickTextActive]}>Ayer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <IconSymbol name="calendar" size={18} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onDateValueChange}
                onDismiss={() => setShowDatePicker(false)}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* 4. Comisión (Opcional si es Gasto) */}
          {currentType === 'expense' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Comisión bancaria (Opcional)</Text>
              <StyledInput
                placeholder={`0.00 (${currencySymbol})`}
                keyboardType="decimal-pad"
                value={commission}
                onChangeText={setCommission}
              />
            </View>
          )}

          {/* 5. Selector de Billetera */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Billetera de origen</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletScrollList}
            >
              {filteredWallets.map((wallet) => {
                const isSelected = wallet.id === selectedWalletId;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletCard, isSelected && styles.walletCardSelected]}
                    onPress={() => setSelectedWalletId(wallet.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.walletIconCircle, isSelected && styles.walletIconCircleSelected]}>
                      <IconSymbol name="wallet.pass.fill" size={16} color={isSelected ? '#FFFFFF' : colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.walletName, isSelected && styles.walletNameSelected]} numberOfLines={1}>
                        {wallet.name}
                      </Text>
                      <Text style={[styles.walletBalance, isSelected && styles.walletBalanceSelected]}>
                        {CURRENCY_SYMBOLS[wallet.currency] || wallet.currency} {wallet.balance.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 6. Cuadrícula de Categorías (Abajo del todo) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Categoría</Text>
              <Text style={styles.sectionBadge}>{currentCategories.length} disponibles</Text>
            </View>

            <View style={styles.categoryGrid}>
              {currentCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected &&
                        (currentType === 'expense'
                          ? styles.categoryCardSelectedExpense
                          : styles.categoryCardSelectedIncome),
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        isSelected &&
                          (currentType === 'expense'
                            ? styles.categoryIconCircleSelectedExpense
                            : styles.categoryIconCircleSelectedIncome),
                      ]}
                    >
                      <IconSymbol
                        name={cat.icon as any}
                        size={22}
                        color={
                          isSelected ? '#FFFFFF' : currentType === 'expense' ? colors.notification : colors.primary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected &&
                          (currentType === 'expense'
                            ? styles.categoryNameSelectedExpense
                            : styles.categoryNameSelectedIncome),
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Botón de Acción Principal al Fondo */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              currentType === 'expense' ? styles.submitButtonExpense : styles.submitButtonIncome,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {transactionToEdit
                ? 'Actualizar Movimiento'
                : currentType === 'expense'
                  ? 'Registrar Gasto'
                  : 'Registrar Ingreso'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function TransactionModal(props: TransactionModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.transactionToEdit
    ? `edit-${props.transactionToEdit.id}`
    : `new-${props.type}-${props.initialWalletId || 'default'}`;

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <TransactionFormContent key={formKey} {...props} />
    </Modal>
  );
}
