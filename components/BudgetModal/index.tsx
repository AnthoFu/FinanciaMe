import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, TouchableOpacity } from 'react-native';

import { useBudgets } from '../../context/BudgetsContext';
import { useCategories } from '../../context/CategoriesContext';
import { Budget, Category, Currency } from '../../types';
import { HorizontalPicker } from '../ui/HorizontalPicker';
import { IconSymbol } from '../ui/IconSymbol';
import { StyledInput } from '../ui/StyledInput';
import { getStyles } from './styles';

interface BudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  budget?: Budget | null;
}

const currencyOptions: Currency[] = ['USD', 'VES', 'USDT', 'EUR'];
const periodOptions: { label: string; value: 'mensual' | 'anual' }[] = [
  { label: 'Mensual', value: 'mensual' },
  { label: 'Anual', value: 'anual' },
];

export function BudgetModal({ isVisible, onClose, budget }: BudgetModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [period, setPeriod] = useState<'mensual' | 'anual'>('mensual');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { addBudget, updateBudget } = useBudgets();
  const { categories } = useCategories();
  const expenseCategories = React.useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);

  useEffect(() => {
    if (isVisible) {
      if (budget) {
        setName(budget.name);
        setAmount(budget.amount.toString());
        setCurrency(budget.currency);
        setPeriod(budget.period);
        setCategoryId(budget.categoryId);
      } else {
        setName('');
        setAmount('');
        setCurrency('USD');
        setPeriod('mensual');
        if (expenseCategories.length > 0) {
          setCategoryId(expenseCategories[0].id);
        } else {
          setCategoryId(null);
        }
      }
    }
  }, [isVisible, budget, expenseCategories]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const budgetAmount = parseFloat(amount);
    if (name.trim() && budgetAmount > 0 && categoryId) {
      const budgetData = {
        name: name.trim(),
        amount: budgetAmount,
        currency,
        period: period as 'mensual' | 'anual',
        categoryId,
      };

      if (budget) {
        updateBudget({ ...budget, ...budgetData });
        showToast({ message: 'Presupuesto actualizado con éxito', type: 'success' });
      } else {
        addBudget(budgetData as Omit<Budget, 'id' | 'creationDate'>);
        showToast({ message: 'Presupuesto creado con éxito', type: 'success' });
      }
      handleClose();
    } else {
      showToast({
        message: 'Por favor, completa todos los campos con valores válidos.',
        type: 'error',
        position: 'top',
      });
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <StyledInput placeholder="Nombre (ej. Mercado)" value={name} onChangeText={setName} />

                <StyledInput placeholder="Monto" value={amount} onChangeText={setAmount} keyboardType="numeric" />

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

              <HorizontalPicker<(typeof periodOptions)[0], 'mensual' | 'anual'>
                label="Periodo"
                data={periodOptions}
                selectedValue={period}
                onSelect={setPeriod}
                keyExtractor={(item) => item.value}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                      {item.label}
                    </Text>
                  </View>
                )}
              />

              <HorizontalPicker<Category, string>
                label="Categoría"
                data={expenseCategories}
                selectedValue={categoryId}
                onSelect={setCategoryId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <IconSymbol name={item.icon as any} size={14} color={isSelected ? '#FFFFFF' : colors.primary} />
                    <Text
                      style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected, { marginLeft: 5 }]}
                    >
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleClose}>
                  <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={handleSave}>
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
