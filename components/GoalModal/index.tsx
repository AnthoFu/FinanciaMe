import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { Currency, SavingsGoal } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
}

const currencyOptions: Currency[] = ['USD', 'VES', 'USDT', 'EUR'];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

function GoalFormContent({ onClose, goal }: Omit<GoalModalProps, 'isVisible'>) {
  const [name, setName] = useState(goal ? goal.name : '');
  const [targetAmount, setTargetAmount] = useState(
    goal ? Number(parseFloat(goal.targetAmount.toFixed(2))).toString() : '',
  );
  const [currency, setCurrency] = useState<Currency>(goal ? goal.currency : 'USD');
  const [createWallet, setCreateWallet] = useState(true);

  const { addSavingsGoal, updateSavingsGoal, createSavingsGoalWithWallet } = useSavingsGoals();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);

  const handleSave = async () => {
    const amount = Math.round((parseFloat(targetAmount) + Number.EPSILON) * 100) / 100;
    if (!name.trim()) {
      showToast({ message: 'Por favor, introduce un nombre para la meta.', type: 'error' });
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast({ message: 'Por favor, introduce un monto objetivo mayor a cero.', type: 'error' });
      return;
    }

    if (goal) {
      updateSavingsGoal({
        ...goal,
        name: name.trim(),
        targetAmount: amount,
        currency,
      });
      showToast({ message: 'Meta actualizada con éxito', type: 'success' });
    } else {
      if (createWallet) {
        await createSavingsGoalWithWallet({
          name: name.trim(),
          targetAmount: amount,
          currency,
        });
      } else {
        addSavingsGoal({
          name: name.trim(),
          targetAmount: amount,
          currency,
        });
      }
      showToast({ message: 'Meta creada con éxito', type: 'success' });
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
          <Text style={styles.topBarTitle}>{goal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Amount Card (Monto Objetivo) */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>Monto Objetivo</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencyBadge}>{currencySymbol}</Text>
                <TextInput
                  style={styles.heroAmountInput}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 2. Nombre de la Meta */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nombre de la meta</Text>
            <StyledInput placeholder="Ej. Fondo de emergencia, Viaje, Auto..." value={name} onChangeText={setName} />
          </View>

          {/* 3. Moneda */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Moneda</Text>
            <View style={styles.currencySelector}>
              {currencyOptions.map((curr) => {
                const isSelected = currency === curr;
                return (
                  <TouchableOpacity
                    key={curr}
                    style={[styles.currencyChip, isSelected && styles.currencyChipSelected]}
                    onPress={() => setCurrency(curr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.currencyChipText, isSelected && styles.currencyChipTextSelected]}>{curr}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Switch para Billetera Dedicada (solo al crear) */}
          {!goal && (
            <View style={styles.section}>
              <View style={styles.switchCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.switchTitle}>Crear billetera de ahorro</Text>
                  <Text style={styles.switchSubtitle}>
                    Crea automáticamente una billetera vinculada para separar este dinero.
                  </Text>
                </View>
                <Switch
                  value={createWallet}
                  onValueChange={setCreateWallet}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>{goal ? 'Guardar Cambios' : 'Crear Meta'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function GoalModal(props: GoalModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.goal ? `edit-goal-${props.goal.id}` : 'new-goal';

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <GoalFormContent key={formKey} {...props} />
    </Modal>
  );
}
