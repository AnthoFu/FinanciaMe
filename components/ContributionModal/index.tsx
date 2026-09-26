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
import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { useWallets } from '../../context/WalletsContext';
import { SavingsGoal } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { getStyles } from './styles';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

interface ContributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

function ContributionFormContent({ onClose, goal }: Omit<ContributionModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { wallets } = useWallets();
  const { addContribution } = useSavingsGoals();

  const [amount, setAmount] = useState('');

  const eligibleWallets = useMemo(() => {
    if (!goal) return [];
    return wallets.filter((w) => w.currency === goal.currency && w.id !== goal.linkedWalletId);
  }, [goal, wallets]);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    eligibleWallets.length > 0 ? eligibleWallets[0].id : null,
  );

  const handleSave = async () => {
    if (!goal) return;

    if (!selectedWalletId) {
      showToast({
        message: 'Por favor, selecciona una billetera de origen.',
        type: 'error',
      });
      return;
    }

    const contributionAmount = Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100;
    if (!contributionAmount || isNaN(contributionAmount) || contributionAmount <= 0) {
      showToast({
        message: 'Por favor, introduce un monto válido mayor a cero.',
        type: 'error',
      });
      return;
    }

    const selectedWallet = eligibleWallets.find((w) => w.id === selectedWalletId);
    if (selectedWallet && selectedWallet.balance < contributionAmount) {
      showToast({
        message: 'La billetera de origen no tiene fondos suficientes.',
        type: 'error',
      });
      return;
    }

    const result = await addContribution(goal, selectedWalletId, contributionAmount);

    if (result.success) {
      showToast({ message: result.message, type: 'success' });
      onClose();
    } else {
      showToast({ message: result.message, type: 'error' });
    }
  };

  const currencySymbol = goal ? CURRENCY_SYMBOLS[goal.currency] || goal.currency : '$';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Añadir Ahorro</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Target Goal Banner */}
          {goal && (
            <View style={styles.goalInfoCard}>
              <View style={styles.goalIconCircle}>
                <IconSymbol name="star.fill" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalLabel}>Meta Destino</Text>
                <Text style={styles.goalName}>{goal.name}</Text>
              </View>
            </View>
          )}

          {/* 1. Hero Amount Card */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>Monto a Aportar</Text>
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

          {/* 2. Billetera de Origen */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Billetera de Origen</Text>
            {eligibleWallets.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.walletScrollList}
              >
                {eligibleWallets.map((wallet) => {
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
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  No tienes otras billeteras en {goal?.currency || 'esta moneda'} para transferir a esta meta.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.submitButton, eligibleWallets.length === 0 && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={eligibleWallets.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Añadir Ahorro</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ContributionModal(props: ContributionModalProps) {
  if (!props.isVisible) return null;

  const formKey = props.goal ? `contribute-${props.goal.id}` : 'contribute';

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <ContributionFormContent key={formKey} {...props} />
    </Modal>
  );
}
