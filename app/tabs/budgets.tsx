import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

import { IconSymbol } from '../../components/ui/IconSymbol';
import { useBudgets } from '../../context/BudgetsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { Budget, ColorTheme } from '../../types';

import { BudgetModal } from '../../components/BudgetModal';
import { useBudgetSpending } from '../../hooks/useBudgetSpending';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

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
      <View
        style={[progressBarStyles.progressBar, { width: `${Math.min(progress, 1) * 100}%`, backgroundColor: color }]}
      />
    </View>
  );
};

const BudgetItem = ({ budget, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const spending = useBudgetSpending(budget);

  const progress = budget.amount > 0 ? spending / budget.amount : 0;

  return (
    <View style={styles.budgetItemContainer}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text style={styles.budgetAmount}>
            {spending.toFixed(2)} / {budget.amount.toFixed(2)} {budget.currency}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <IconSymbol name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <IconSymbol name="trash" size={20} color={colors.notification} />
          </TouchableOpacity>
        </View>
      </View>
      <ProgressBar
        progress={progress}
        color={progress > 1 ? colors.notification : colors.primary}
        backgroundColor={colors.border}
      />
    </View>
  );
};

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const globalStyles = getThemedStyles(colors);
  const styles = getStyles(colors);

  const { budgets, deleteBudget } = useBudgets();
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsBudgetModalVisible(true);
  };

  const handleDeleteBudget = (budget: Budget) => {
    setBudgetToDelete(budget);
    setDeleteModalVisible(true);
  };

  const confirmDeleteBudget = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete.id);
      showToast({ message: 'Presupuesto eliminado con éxito', type: 'success' });
      setBudgetToDelete(null);
    }
  };

  const handleAddNewBudget = () => {
    setSelectedBudget(null);
    setIsBudgetModalVisible(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Presupuestos</Text>
        <TouchableOpacity onPress={handleAddNewBudget}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={budgets}
        renderItem={({ item }) => (
          <BudgetItem budget={item} onEdit={() => handleEditBudget(item)} onDelete={() => handleDeleteBudget(item)} />
        )}
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
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setBudgetToDelete(null);
        }}
        onConfirm={confirmDeleteBudget}
        title="Eliminar Presupuesto"
        message={`¿Estás seguro de que quieres eliminar el presupuesto "${budgetToDelete?.name}"?`}
        confirmText="Eliminar"
        type="destructive"
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
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    budgetInfo: {
      flex: 1,
    },
    actionIcons: {
      flexDirection: 'row',
    },
    iconButton: {
      padding: 5,
      marginLeft: 10,
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
