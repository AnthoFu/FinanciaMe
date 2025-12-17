import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

import { IconSymbol } from '../../components/ui/IconSymbol';
import { useBudgets } from '../../context/BudgetsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { Budget, ColorTheme } from '../../types';

import { BudgetModal } from '../../components/BudgetModal';
import { useBudgetSpending } from '../../hooks/useBudgetSpending';

const progressBarStyles = StyleSheet.create({
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
  },
});

const ProgressBar = ({
  progress,
  color,
  backgroundColor,
}: {
  progress: number;
  color: string;
  backgroundColor: string;
}) => {
  return (
    <View style={[progressBarStyles.progressBarContainer, { backgroundColor }]}>
      <View style={[progressBarStyles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

const BudgetItem = ({ budget }: { budget: Budget }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const spending = useBudgetSpending(budget);

  const progress = budget.amount > 0 ? spending / budget.amount : 0;

  return (
    <View style={styles.budgetItemContainer}>
      <View style={styles.budgetInfo}>
        <Text style={styles.budgetName}>{budget.name}</Text>
        <Text style={styles.budgetAmount}>
          {spending.toFixed(2)} / {budget.amount.toFixed(2)} {budget.currency}
        </Text>
      </View>
      <ProgressBar progress={progress} color={colors.primary} backgroundColor={colors.border} />
    </View>
  );
};

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const globalStyles = getThemedStyles(colors);
  const styles = getStyles(colors);

  const { budgets } = useBudgets();
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Presupuestos</Text>
        <TouchableOpacity onPress={() => setIsBudgetModalVisible(true)}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={budgets}
        renderItem={({ item }) => <BudgetItem budget={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes presupuestos. ¡Crea uno!</Text>}
      />
      <BudgetModal
        isVisible={isBudgetModalVisible}
        onClose={() => {
          setSelectedBudget(null);
          setIsBudgetModalVisible(false);
        }}
        budget={selectedBudget}
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    budgetItemContainer: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    budgetInfo: {
      marginBottom: 10,
    },
    budgetName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    budgetAmount: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
      marginTop: 5,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: colors.text,
      opacity: 0.6,
    },
  });
