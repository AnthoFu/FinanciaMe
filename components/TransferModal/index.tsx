import { useTheme } from '@/hooks/useTheme';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { Wallet } from '../../types';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { getStyles } from './styles';
import { StyledInput } from '../ui/StyledInput';
import { HorizontalPicker } from '../ui/HorizontalPicker';

interface TransferModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (fromWalletId: string, toWalletId: string, fromAmount: number, toAmount: number, rate: number) => void;
  showToast: (message: string) => void;
}

export default function TransferModal({ isVisible, onClose, onSubmit, showToast }: TransferModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { wallets } = useWallets();
  const { averageRate } = useExchangeRates();

  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const fromWallet = useMemo(() => wallets.find((w) => w.id === fromWalletId), [wallets, fromWalletId]);
  const toWallet = useMemo(() => wallets.find((w) => w.id === toWalletId), [wallets, toWalletId]);

  useEffect(() => {
    if (isVisible) {
      // Reset state on open
      setFromWalletId(wallets.length > 0 ? wallets[0].id : null);
      setToWalletId(wallets.length > 1 ? wallets[1].id : null);
      setFromAmount('');
      setToAmount('');
      setExchangeRate(averageRate ? averageRate.toString() : '1');
    }
  }, [isVisible, wallets, averageRate]);

  useEffect(() => {
    if (fromWallet && toWallet && fromWallet.currency !== toWallet.currency) {
      setExchangeRate(averageRate ? averageRate.toString() : '1');
    } else {
      setExchangeRate('1');
    }
  }, [fromWallet, toWallet, averageRate]);

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    const rate = parseFloat(exchangeRate);
    const from = parseFloat(amount);
    if (rate && from && fromWallet && toWallet) {
      if (fromWallet.currency === 'VEF' && toWallet.currency === 'USD') {
        setToAmount((from / rate).toFixed(2));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VEF') {
        setToAmount((from * rate).toFixed(2));
      } else {
        setToAmount(amount);
      }
    }
  };

  const handleToAmountChange = (amount: string) => {
    setToAmount(amount);
    const from = parseFloat(fromAmount);
    const to = parseFloat(amount);
    if (from && to && fromWallet && toWallet && fromWallet.currency !== toWallet.currency) {
      if (fromWallet.currency === 'VEF' && toWallet.currency === 'USD') {
        setExchangeRate((from / to).toFixed(4));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VEF') {
        setExchangeRate((to / from).toFixed(4));
      }
    }
  };

  const handleRateChange = (rateStr: string) => {
    setExchangeRate(rateStr);
    const rate = parseFloat(rateStr);
    const from = parseFloat(fromAmount);
    if (rate && from && fromWallet && toWallet) {
      if (fromWallet.currency === 'VEF' && toWallet.currency === 'USD') {
        setToAmount((from / rate).toFixed(2));
      } else if (fromWallet.currency === 'USD' && toWallet.currency === 'VEF') {
        setToAmount((from * rate).toFixed(2));
      }
    }
  };

  const handleSubmit = () => {
    const fromAmountNum = parseFloat(fromAmount);
    const toAmountNum = parseFloat(toAmount);
    const rateNum = parseFloat(exchangeRate);

    if (!fromWalletId || !toWalletId || !fromAmountNum || !toAmountNum || !rateNum) {
      showToast('Por favor, completa todos los campos.');
      return;
    }
    if (fromWalletId === toWalletId) {
      showToast('Las billeteras de origen y destino no pueden ser la misma.');
      return;
    }
    if (fromWallet && fromWallet.balance < fromAmountNum) {
      Alert.alert('Saldo Insuficiente', 'La billetera de origen no tiene fondos suficientes.');
      return;
    }

    onSubmit(fromWalletId, toWalletId, fromAmountNum, toAmountNum, rateNum);
    onClose();
  };

  const isMultiCurrency = fromWallet && toWallet && fromWallet.currency !== toWallet.currency;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Realizar Transferencia</Text>

              <HorizontalPicker<Wallet, string>
                label="Desde"
                data={wallets}
                selectedValue={fromWalletId}
                onSelect={setFromWalletId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <HorizontalPicker<Wallet, string>
                label="Hacia"
                data={wallets}
                selectedValue={toWalletId}
                onSelect={setToWalletId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <StyledInput
                placeholder={`Monto a Enviar (${fromWallet ? fromWallet.currency : '...'})`}
                keyboardType="numeric"
                value={fromAmount}
                onChangeText={handleFromAmountChange}
              />

              {isMultiCurrency && (
                <>
                  <StyledInput
                    placeholder={`Tasa de Cambio (1 USD = ? VEF)`}
                    keyboardType="numeric"
                    value={exchangeRate}
                    onChangeText={handleRateChange}
                  />
                  <StyledInput
                    placeholder={`Monto a Recibir (${toWallet ? toWallet.currency : '...'})`}
                    keyboardType="numeric"
                    value={toAmount}
                    onChangeText={handleToAmountChange}
                  />
                </>
              )}
              {!isMultiCurrency && (
                <StyledInput
                  placeholder={`Monto a Recibir (${toWallet ? toWallet.currency : '...'})`}
                  keyboardType="numeric"
                  value={toAmount}
                  onChangeText={setToAmount}
                  editable={false} // Same currency, so same amount
                />
              )}
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color={colors.notification} />
              <Button title="Aceptar" onPress={handleSubmit} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
