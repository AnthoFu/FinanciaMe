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
import { useBudgets } from '../../context/BudgetsContext';
import { useCategories } from '../../context/CategoriesContext';
import { Budget, Currency } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface BudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  budget?: Budget | null;
}

const currencyOptions: Currency[] = ['USD', 'VES', 'USDT', 'EUR'];
const periodOptions: { label: string; value: 'mensual' | 'anual' }[] = [
  { label: 'Mensual', value: 'mensual' },
  { label: 'Anual', value: 'anual' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

function BudgetFormContent({ onClose, budget }: Omit<BudgetModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { addBudget, updateBudget } = useBudgets();
  const { categories } = useCategories();

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const [name, setName] = useState(budget ? budget.name : '');
  const [amount, setAmount] = useState(budget ? Number(parseFloat(budget.amount.toFixed(2))).toString() : '');
  const [currency, setCurrency] = useState<Currency>(budget ? budget.currency : 'USD');
  const [period, setPeriod] = useState<'mensual' | 'anual'>(budget ? budget.period : 'mensual');
  const [categoryId, setCategoryId] = useState<string | null>(() => {
    if (budget) return budget.categoryId;
    return expenseCategories.length > 0 ? expenseCategories[0].id : null;
  });

  const handleSave = () => {
    const budgetAmount = Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100;
    if (!name.trim()) {
      showToast({ message: 'Por favor, introduce un nombre para el presupuesto.', type: 'error' });
      return;
    }
    if (!budgetAmount || isNaN(budgetAmount) || budgetAmount <= 0) {
      showToast({ message: 'Por favor, introduce un monto válido mayor a cero.', type: 'error' });
      return;
    }
    if (!categoryId) {
      showToast({ message: 'Por favor, selecciona una categoría.', type: 'error' });
      return;
    }

    const budgetData = {
      name: name.trim(),
      amount: budgetAmount,
      currency,
      period,
      categoryId,
    };

    if (budget) {
      updateBudget({ ...budget, ...budgetData });
      showToast({ message: 'Presupuesto actualizado con éxito', type: 'success' });
    } else {
      addBudget(budgetData as Omit<Budget, 'id' | 'creationDate'>);
      showToast({ message: 'Presupuesto creado con éxito', type: 'success' });
    }
    onClose();
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
          <Text style={styles.topBarTitle}>{budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Amount Card (Límite de Presupuesto) */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>Límite de Presupuesto</Text>
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

          {/* 2. Nombre del Presupuesto */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nombre</Text>
            <StyledInput
              placeholder="Ej. Salidas, Mercado mensual, Entretenimiento..."
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

          {/* 4. Período */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Período</Text>
            <View style={styles.chipSelector}>
              {periodOptions.map((opt) => {
                const isSelected = period === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setPeriod(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categoría Asociada</Text>
            <View style={styles.categoryGrid}>
              {expenseCategories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                    onPress={() => setCategoryId(cat.id)}
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>{budget ? 'Guardar Cambios' : 'Crear Presupuesto'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BudgetModal(props: BudgetModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.budget ? `edit-budget-${props.budget.id}` : 'new-budget';

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <BudgetFormContent key={formKey} {...props} />
    </Modal>
  );
}
