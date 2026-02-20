import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { Currency } from '../../types';
import { HorizontalPicker } from '../ui/HorizontalPicker';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const currencyOptions: Currency[] = ['USD', 'VES', 'USDT'];

// A simple component to render items in the picker
const PickerItem = ({ item, isSelected }: { item: string; isSelected: boolean }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { paddingHorizontal: 20, paddingVertical: 10, marginHorizontal: 5, borderRadius: 20 },
        isSelected ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
      ]}
    >
      <Text style={{ color: isSelected ? 'white' : colors.text }}>{item}</Text>
    </View>
  );
};

export function GoalModal({ isVisible, onClose }: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const { addSavingsGoal } = useSavingsGoals();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleClose = () => {
    setName('');
    setTargetAmount('');
    setCurrency('USD');
    onClose();
  };

  const handleSave = () => {
    const amount = parseFloat(targetAmount);
    if (name.trim() && amount > 0) {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: amount,
        currency,
      });
      handleClose();
    } else {
      alert('Por favor, introduce un nombre válido y un monto mayor a cero.');
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Nueva Meta de Ahorro</Text>

            <StyledInput
              placeholder="Nombre de la meta (ej. PC Gamer)"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <StyledInput
              placeholder="Monto Objetivo"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.currencyContainer}>
              <HorizontalPicker<Currency, Currency>
                label="Moneda"
                data={currencyOptions}
                selectedValue={currency}
                keyExtractor={(item) => item}
                onSelect={(value) => setCurrency(value as Currency)}
                renderItem={(item, isSelected) => <PickerItem item={item} isSelected={isSelected} />}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={handleClose} color={colors.notification} />
              <Button title="Guardar" onPress={handleSave} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
