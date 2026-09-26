import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
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
import { Wallet } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (wallet: Omit<Wallet, 'id'>) => void;
  initialData?: Wallet | null;
}

const currencyOptions: ('USD' | 'VES' | 'USDT' | 'EUR')[] = ['USD', 'VES', 'USDT', 'EUR'];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

function WalletFormContent({ onClose, onSubmit, initialData }: Omit<WalletModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);

  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData ? initialData.name : '');
  const [balance, setBalance] = useState(
    initialData ? Number(parseFloat(initialData.balance.toFixed(2))).toString() : '',
  );
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT' | 'EUR'>(
    initialData ? (initialData.currency as any) : 'USD',
  );

  const handleSubmit = () => {
    const numericBalance = parseFloat(balance);
    if (!name.trim()) {
      showToast({ message: 'Por favor, ingresa un nombre para la billetera.', type: 'error' });
      return;
    }
    if (isNaN(numericBalance)) {
      showToast({ message: 'Por favor, ingresa un saldo inicial válido.', type: 'error' });
      return;
    }

    onSubmit({
      name: name.trim(),
      balance: parseFloat(numericBalance.toFixed(2)),
      currency,
    });
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
          <Text style={styles.topBarTitle}>{isEditing ? 'Editar Billetera' : 'Nueva Billetera'}</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Amount Card (Saldo Inicial o Saldo Actual) */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>{isEditing ? 'Saldo Actual' : 'Saldo Inicial'}</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencyBadge}>{currencySymbol}</Text>
                <TextInput
                  style={styles.heroAmountInput}
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  placeholderTextColor={colors.icon}
                  keyboardType="decimal-pad"
                  editable={!isEditing}
                  autoFocus={!isEditing}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 2. Nombre de la Billetera */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nombre de la Billetera</Text>
            <StyledInput
              placeholder="Ej. Efectivo, Banesco, Binance, Tarjeta Débito..."
              value={name}
              onChangeText={setName}
              autoFocus={isEditing}
            />
          </View>

          {/* 3. Selector de Moneda */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Moneda Principal</Text>
            <View style={styles.chipSelector}>
              {currencyOptions.map((curr) => {
                const isSelected = currency === curr;
                return (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      isEditing && !isSelected && { opacity: 0.4 },
                    ]}
                    onPress={() => !isEditing && setCurrency(curr)}
                    activeOpacity={0.8}
                    disabled={isEditing}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{curr}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Nota Informativa si está en Edición */}
          {isEditing && (
            <View style={styles.noteCard}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text style={styles.noteText}>
                El saldo y la moneda no se modifican directamente aquí. Se ajustan de forma precisa al registrar
                ingresos, gastos o transferencias.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>{isEditing ? 'Guardar Cambios' : 'Crear Billetera'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function WalletModal(props: WalletModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.initialData ? `edit-wallet-${props.initialData.id}` : 'new-wallet';

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <WalletFormContent key={formKey} {...props} />
    </Modal>
  );
}
