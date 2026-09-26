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
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { Wallet } from '../../types';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  VES: 'Bs.',
  USDT: 'USDT',
  EUR: '€',
};

interface TransferModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (
    fromWalletId: string,
    toWalletId: string,
    fromAmount: number,
    toAmount: number,
    rate: number,
    commission?: number,
  ) => void;
}

function TransferFormContent({ onClose, onSubmit }: Omit<TransferModalProps, 'isVisible'>) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const { wallets } = useWallets();
  const { averageRate } = useExchangeRates();

  const [fromWalletId, setFromWalletId] = useState<string | null>(wallets.length > 0 ? wallets[0].id : null);
  const [toWalletId, setToWalletId] = useState<string | null>(wallets.length > 1 ? wallets[1].id : null);
  const [fromAmount, setFromAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(averageRate ? averageRate.toString() : '1');

  const fromWallet = useMemo(() => wallets.find((w) => w.id === fromWalletId), [wallets, fromWalletId]);
  const toWallet = useMemo(() => wallets.find((w) => w.id === toWalletId), [wallets, toWalletId]);

  const isMultiCurrency = Boolean(fromWallet && toWallet && fromWallet.currency !== toWallet.currency);

  const handleFromWalletSelect = (walletId: string) => {
    setFromWalletId(walletId);
    const selected = wallets.find((w) => w.id === walletId);
    if (selected && toWallet && selected.currency !== toWallet.currency) {
      setExchangeRate(averageRate ? averageRate.toString() : '1');
    } else {
      setExchangeRate('1');
    }
  };

  const handleToWalletSelect = (walletId: string) => {
    setToWalletId(walletId);
    const selected = wallets.find((w) => w.id === walletId);
    if (fromWallet && selected && fromWallet.currency !== selected.currency) {
      setExchangeRate(averageRate ? averageRate.toString() : '1');
    } else {
      setExchangeRate('1');
    }
  };

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    const rate = parseFloat(exchangeRate);
    const from = parseFloat(amount);
    if (rate && from && fromWallet && toWallet) {
      if (fromWallet.currency === 'VES' && toWallet.currency === 'USD') {
        setToAmount((from / rate).toFixed(2));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VES') {
        setToAmount((from * rate).toFixed(2));
      } else {
        setToAmount(amount);
      }
    } else if (!amount) {
      setToAmount('');
    }
  };

  const handleToAmountChange = (amount: string) => {
    setToAmount(amount);
    const from = parseFloat(fromAmount);
    const to = parseFloat(amount);
    if (from && to && fromWallet && toWallet && fromWallet.currency !== toWallet.currency) {
      if (fromWallet.currency === 'VES' && toWallet.currency === 'USD') {
        setExchangeRate((from / to).toFixed(4));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VES') {
        setExchangeRate((to / from).toFixed(4));
      }
    }
  };

  const handleRateChange = (rateStr: string) => {
    setExchangeRate(rateStr);
    const rate = parseFloat(rateStr);
    const from = parseFloat(fromAmount);
    if (rate && from && fromWallet && toWallet) {
      if (fromWallet.currency === 'VES' && toWallet.currency === 'USD') {
        setToAmount((from / rate).toFixed(2));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VES') {
        setToAmount((from * rate).toFixed(2));
      }
    }
  };

  const handleSubmit = () => {
    const fromAmountNum = parseFloat(fromAmount);
    const commissionNum = parseFloat(commission) || 0;
    const toAmountNum = parseFloat(toAmount);
    const rateNum = parseFloat(exchangeRate) || 1;

    if (!fromWalletId || !toWalletId || !fromAmountNum || isNaN(fromAmountNum) || fromAmountNum <= 0) {
      showToast({ message: 'Por favor, introduce un monto válido.', type: 'error' });
      return;
    }
    if (fromWalletId === toWalletId) {
      showToast({ message: 'Las billeteras de origen y destino no pueden ser la misma.', type: 'error' });
      return;
    }
    if (fromWallet && fromWallet.balance < fromAmountNum + commissionNum) {
      showToast({
        message: 'La billetera de origen no tiene fondos suficientes (incluyendo comisión).',
        type: 'error',
        position: 'top',
      });
      return;
    }

    onSubmit(fromWalletId, toWalletId, fromAmountNum, toAmountNum || fromAmountNum, rateNum, commissionNum);
    onClose();
  };

  const fromCurrencySymbol = fromWallet ? CURRENCY_SYMBOLS[fromWallet.currency] || fromWallet.currency : '$';
  const toCurrencySymbol = toWallet ? CURRENCY_SYMBOLS[toWallet.currency] || toWallet.currency : '$';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Realizar Transferencia</Text>
          <View style={styles.topBarRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Amount Card (Monto a Enviar) */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.heroAmountCard}>
              <Text style={styles.heroAmountLabel}>Monto a Enviar</Text>
              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencyBadge}>{fromCurrencySymbol}</Text>
                <TextInput
                  style={styles.heroAmountInput}
                  value={fromAmount}
                  onChangeText={handleFromAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.text + '40'}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 2. Billetera de Origen */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Billetera de Origen (Desde)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletScrollList}
            >
              {wallets.map((wallet) => {
                const isSelected = wallet.id === fromWalletId;
                const isDestination = wallet.id === toWalletId;
                const currSymbol = CURRENCY_SYMBOLS[wallet.currency] || wallet.currency;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[
                      styles.walletCard,
                      isSelected && styles.walletCardSelected,
                      isDestination && { opacity: 0.4 },
                    ]}
                    onPress={() => !isDestination && handleFromWalletSelect(wallet.id)}
                    activeOpacity={0.8}
                    disabled={isDestination}
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

          {/* 3. Billetera de Destino */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Billetera de Destino (Hacia)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletScrollList}
            >
              {wallets.map((wallet) => {
                const isSelected = wallet.id === toWalletId;
                const isOrigin = wallet.id === fromWalletId;
                const currSymbol = CURRENCY_SYMBOLS[wallet.currency] || wallet.currency;
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletCard, isSelected && styles.walletCardSelected, isOrigin && { opacity: 0.4 }]}
                    onPress={() => !isOrigin && handleToWalletSelect(wallet.id)}
                    activeOpacity={0.8}
                    disabled={isOrigin}
                  >
                    <View style={[styles.walletIconCircle, isSelected && styles.walletIconCircleSelected]}>
                      <IconSymbol name="arrow.down.left" size={16} color={isSelected ? '#FFFFFF' : colors.text} />
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

          {/* 4. Multi-Currency Details & Conversion */}
          {isMultiCurrency ? (
            <View style={styles.exchangeCard}>
              <Text style={styles.exchangeCardTitle}>Conversión de Moneda</Text>
              <StyledInput
                label="Tasa de Cambio"
                placeholder={`1 USD = ? VES`}
                keyboardType="decimal-pad"
                value={exchangeRate}
                onChangeText={handleRateChange}
              />
              <StyledInput
                label={`Monto a Recibir (${toCurrencySymbol})`}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={toAmount}
                onChangeText={handleToAmountChange}
              />
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Monto a Recibir ({toCurrencySymbol})</Text>
              <StyledInput
                placeholder={`0.00 (${toCurrencySymbol})`}
                keyboardType="decimal-pad"
                value={fromAmount}
                editable={false}
              />
            </View>
          )}

          {/* 5. Comisión Opcional */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Comisión (Opcional en {fromCurrencySymbol})</Text>
            <StyledInput
              placeholder={`0.00 (${fromCurrencySymbol})`}
              keyboardType="decimal-pad"
              value={commission}
              onChangeText={setCommission}
            />
          </View>
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>Transferir</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function TransferModal(props: TransferModalProps) {
  if (!props.isVisible) return null;

  return (
    <Modal
      visible={props.isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onClose}
    >
      <TransferFormContent key="transfer-form" {...props} />
    </Modal>
  );
}
