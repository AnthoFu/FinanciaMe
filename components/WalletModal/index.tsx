import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Wallet } from '../../types';
import { getStyles } from './styles';
import { StyledInput } from '../ui/StyledInput';

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
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState<'USD' | 'VEF' | 'USDT'>('USD');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBalance(initialData.balance.toString());
      setCurrency(initialData.currency);
    } else {
      setName('');
      setBalance('0');
      setCurrency('USD');
    }
  }, [initialData, isVisible]);

  const handleSubmit = () => {
    const numericBalance = parseFloat(balance);
    if (!name || isNaN(numericBalance)) {
      alert('Por favor, ingresa un nombre y un saldo válidos.');
      return;
    }

    onSubmit({
      name,
      balance: numericBalance,
      currency: currency,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar' : 'Añadir'} Billetera</Text>
            <StyledInput placeholder="Nombre de la billetera" value={name} onChangeText={setName} />
            <StyledInput
              placeholder="Saldo inicial"
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
              editable={!isEditing}
            />

            <View style={styles.currencySelector}>
              <TouchableOpacity
                style={[styles.currencyOption, currency === 'VEF' && styles.currencyOptionSelected]}
                onPress={() => !isEditing && setCurrency('VEF')}
                disabled={isEditing}
              >
                <Text style={[styles.currencyText, currency === 'VEF' && styles.currencyTextSelected]}>VEF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.currencyOption, currency === 'USD' && styles.currencyOptionSelected]}
                onPress={() => !isEditing && setCurrency('USD')}
                disabled={isEditing}
              >
                <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextSelected]}>USD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.currencyOption, currency === 'USDT' && styles.currencyOptionSelected]}
                onPress={() => !isEditing && setCurrency('USDT')}
                disabled={isEditing}
              >
                <Text style={[styles.currencyText, currency === 'USDT' && styles.currencyTextSelected]}>USDT</Text>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <Text style={styles.noteText}>
                El saldo y la moneda no se pueden editar. Para ajustarlos, realiza ingresos o gastos.
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color={colors.notification} />
              <Button title={isEditing ? 'Guardar' : 'Añadir'} onPress={handleSubmit} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
