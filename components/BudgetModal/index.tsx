import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';

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

const currencyOptions: Currency[] = ['USD', 'VEF', 'USDT'];
const periodOptions: ('mensual' | 'anual')[] = ['mensual', 'anual'];

const PickerItem = ({ item, isSelected }: { item: string; isSelected: boolean }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { paddingHorizontal: 20, paddingVertical: 10, marginHorizontal: 5, borderRadius: 20 },
        isSelected ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
      ]}
    >
      <Text style={{ color: isSelected ? 'white' : colors.text, textTransform: 'capitalize' }}>{item}</Text>
    </View>
  );
};

export function BudgetModal({ isVisible, onClose, budget }: BudgetModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [period, setPeriod] = useState<'mensual' | 'anual'>('mensual');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { addBudget, updateBudget } = useBudgets();
  const { categories } = useCategories();
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const { colors } = useTheme();
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
    setName('');
    setAmount('');
    setCurrency('USD');
    setPeriod('mensual');
    setCategoryId(null);
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
      } else {
        addBudget(budgetData as Omit<Budget, 'id' | 'creationDate'>);
      }
      handleClose();
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.title, { color: colors.text }]}>
                {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </Text>

              <StyledInput
                placeholder="Nombre del presupuesto (ej. Mercado)"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <StyledInput
                placeholder="Monto del presupuesto"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
              />

              <HorizontalPicker<Currency, Currency>
                label="Moneda"
                data={currencyOptions}
                selectedValue={currency}
                onSelect={(value) => setCurrency(value as Currency)}
                keyExtractor={(item) => item}
                renderItem={(item, isSelected) => <PickerItem item={item} isSelected={isSelected} />}
              />

              <HorizontalPicker<string, 'mensual' | 'anual'>
                label="Periodo"
                data={periodOptions}
                selectedValue={period}
                onSelect={(value) => setPeriod(value as 'mensual' | 'anual')}
                keyExtractor={(item) => item as 'mensual' | 'anual'}
                renderItem={(item, isSelected) => <PickerItem item={item} isSelected={isSelected} />}
              />

              <HorizontalPicker<Category, string>
                label="Categoría"
                data={expenseCategories}
                selectedValue={categoryId}
                onSelect={setCategoryId}
                keyExtractor={(item) => item.id}
                renderItem={(item, isSelected) => (
                  <View style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
                    <IconSymbol name={item.icon as any} size={14} color={isSelected ? colors.card : colors.primary} />
                    <Text
                      style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected, { marginLeft: 5 }]}
                    >
                      {item.name}
                    </Text>
                  </View>
                )}
              />

              <View style={styles.buttonContainer}>
                <Button title="Cancelar" onPress={handleClose} color={colors.notification} />
                <Button title="Guardar" onPress={handleSave} color={colors.primary} />
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
