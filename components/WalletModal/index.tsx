import { useTheme } from '@/hooks/useTheme';
import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Wallet } from '../../types';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (wallet: Omit<Wallet, 'id'>) => void;
  initialData?: Wallet | null;
}

export default function WalletModal({ isVisible, onClose, onSubmit, initialData }: WalletModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT' | 'EUR'>('USD');

  const isEditing = !!initialData;

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setName(initialData.name);
        setBalance(initialData.balance.toString());
        setCurrency(initialData.currency as any);
      } else {
        setName('');
        setBalance('');
        setCurrency('USD');
      }
    }
  }, [initialData, isVisible]);

  const handleSubmit = useCallback(() => {
    const numericBalance = parseFloat(balance);
    if (!name || isNaN(numericBalance)) {
      alert('Por favor, ingresa un nombre y un saldo válidos.');
      return;
    }

    onSubmit({
      name,
      balance: numericBalance,
      currency: currency as any,
    });
    onClose();
  }, [name, balance, currency, onSubmit, onClose]);

  const handleCurrencyChange = useCallback(
    (newCurrency: 'USD' | 'VES' | 'USDT' | 'EUR') => {
      if (!isEditing) {
        setCurrency(newCurrency);
      }
    },
    [isEditing],
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar' : 'Añadir'} Billetera</Text>

            <View style={styles.section}>
              <StyledInput placeholder="Nombre (ej. Efectivo)" value={name} onChangeText={setName} />

              <StyledInput
                placeholder="Saldo inicial"
                keyboardType="numeric"
                value={balance}
                onChangeText={setBalance}
                editable={!isEditing}
              />

              <View style={styles.currencySelector}>
                {(['VES', 'USD', 'USDT', 'EUR'] as const).map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyOption,
                      currency === curr && styles.currencyOptionSelected,
                      isEditing && currency !== curr && { opacity: 0.5 },
                    ]}
                    onPress={() => handleCurrencyChange(curr)}
                    disabled={isEditing}
                  >
                    <Text style={[styles.currencyText, currency === curr && styles.currencyTextSelected]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {isEditing && (
              <Text style={styles.noteText}>
                El saldo y la moneda no se pueden editar directamente. Realiza transacciones para ajustarlos.
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={handleSubmit}>
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{isEditing ? 'Guardar' : 'Añadir'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
