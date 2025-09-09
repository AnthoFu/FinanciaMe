import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';

import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { useWallets } from '../../context/WalletsContext';
import { SavingsGoal, Wallet } from '../../types';
import { HorizontalPicker } from '../ui/HorizontalPicker';
import { StyledInput } from '../ui/StyledInput';
import { styles } from './styles';

interface ContributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

const WalletPickerItem = ({ item, isSelected }: { item: Wallet; isSelected: boolean }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { padding: 10, marginHorizontal: 5, borderRadius: 8 },
        isSelected ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
      ]}
    >
      <Text style={{ color: isSelected ? 'white' : colors.text, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ color: isSelected ? 'white' : colors.text }}>
        {item.balance.toFixed(2)} {item.currency}
      </Text>
    </View>
  );
};

export function ContributionModal({ isVisible, onClose, goal }: ContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const { wallets } = useWallets();
  const { addContribution } = useSavingsGoals();
  const { colors } = useTheme();

  const [walletsForCurrency, setWalletsForCurrency] = useState<Wallet[]>([]);

  useEffect(() => {
    if (goal) {
      const filteredWallets = wallets.filter((w) => w.currency === goal.currency);
      setWalletsForCurrency(filteredWallets);
      if (filteredWallets.length > 0) {
        setSelectedWalletId(filteredWallets[0].id);
      } else {
        setSelectedWalletId(null);
      }
    }
  }, [goal, wallets]);

  const handleSave = async () => {
    if (!goal || !selectedWalletId) return;

    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      Alert.alert('Error', 'Por favor, introduce un monto válido.');
      return;
    }

    const result = await addContribution(goal, selectedWalletId, contributionAmount);

    if (result.success) {
      Alert.alert('Éxito', result.message);
      handleClose();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose(); // Keep selected wallet for next time, but close the modal
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Añadir Ahorro a &quot;{goal?.name}&quot;</Text>

            <StyledInput
              placeholder={`Monto en ${goal?.currency}`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            {walletsForCurrency.length > 0 ? (
              <View style={styles.walletContainer}>
                <HorizontalPicker<Wallet>
                  label="Billetera de Origen"
                  data={walletsForCurrency}
                  selectedValue={selectedWalletId}
                  keyExtractor={(item) => item.id}
                  onSelect={setSelectedWalletId}
                  renderItem={(item, isSelected) => <WalletPickerItem item={item} isSelected={isSelected} />}
                />
              </View>
            ) : (
              <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 15 }}>
                No tienes billeteras en {goal?.currency} para añadir ahorros.
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={handleClose} color="#ff3b30" />
              <Button title="Guardar" onPress={handleSave} disabled={!selectedWalletId} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
