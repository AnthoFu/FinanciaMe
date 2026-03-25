import { useTheme } from '@/hooks/useTheme';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';

import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { Currency, SavingsGoal } from '../../types';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
}

const currencyOptions: Currency[] = ['USD', 'VES', 'USDT'];

export function GoalModal({ isVisible, onClose, goal }: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const { addSavingsGoal, updateSavingsGoal } = useSavingsGoals();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    if (isVisible) {
      if (goal) {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrency(goal.currency);
      } else {
        setName('');
        setTargetAmount('');
        setCurrency('USD');
      }
    }
  }, [goal, isVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const amount = parseFloat(targetAmount);
    if (name.trim() && amount > 0) {
      if (goal) {
        updateSavingsGoal({
          ...goal,
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
      handleClose();
    } else {
      alert('Por favor, introduce un nombre válido y un monto mayor a cero.');
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              {goal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
            </Text>

            <View style={styles.section}>
              <StyledInput
                placeholder="Nombre (ej. Mi PC Gamer)"
                value={name}
                onChangeText={setName}
              />

              <StyledInput
                placeholder="Monto Objetivo"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
              />

              <View style={styles.currencySelector}>
                {currencyOptions.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[styles.currencyOption, currency === curr && styles.currencyOptionSelected]}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text style={[styles.currencyText, currency === curr && styles.currencyTextSelected]}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.submitButton]} 
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
