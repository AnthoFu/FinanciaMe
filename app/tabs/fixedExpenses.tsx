import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FixedExpenseModal from '../../components/FixedExpenseModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useCategories } from '../../context/CategoriesContext';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useWallets } from '../../context/WalletsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { FixedExpense, ColorTheme } from '../../types';

const formatFrequency = (expense: FixedExpense): string => {
  switch (expense.frequency) {
    case 'daily':
      return 'Se paga a diario';
    case 'weekly':
      return 'Se paga semanalmente';
    case 'biweekly':
      return 'Se paga quincenalmente';
    case 'monthly':
      return `Día ${expense.dayOfMonth} de cada mes`;
    case 'yearly':
      return 'Se paga anualmente';
    default:
      // Fallback for older data that might not have frequency
      if ('dayOfMonth' in expense) {
        return `Día ${expense.dayOfMonth} de cada mes`;
      }
      return 'Frecuencia no especificada';
  }
};

export default function FixedExpensesScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);

  const { expenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useFixedExpenses();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

  const handleAddNew = () => {
    if (wallets.length === 0) {
      showToast({
        message: 'Debes crear al menos una billetera antes de añadir un gasto fijo.',
        type: 'error',
        position: 'top',
      });
      return;
    }
    setEditingExpense(null);
    setModalVisible(true);
  };

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setExpenseToDeleteId(id);
    setDeleteModalVisible(true);
  };

  const confirmDeleteExpense = () => {
    if (expenseToDeleteId) {
      deleteFixedExpense(expenseToDeleteId);
      showToast({ message: 'Gasto fijo eliminado con éxito', type: 'success' });
      setExpenseToDeleteId(null);
    }
  };

  const handleSubmit = async (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const isEditing = !!editingExpense;
    try {
      if (isEditing) {
        await updateFixedExpense({ ...editingExpense, ...expenseData });
      } else {
        await addFixedExpense(expenseData);
      }
      showToast({ message: isEditing ? 'Gasto fijo actualizado' : 'Gasto fijo creado con éxito', type: 'success' });
    } catch {
      showToast({ message: 'Error al guardar el gasto fijo', type: 'error' });
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Gastos Fijos</Text>
        <TouchableOpacity onPress={handleAddNew}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const wallet = wallets.find((w) => w.id === item.walletId);
          const category = categories.find((c) => c.id === item.categoryId);
          return (
            <View style={styles.itemContainer}>
              {category && (
                <View style={styles.iconContainer}>
                  <IconSymbol name={category.icon as any} size={24} color={colors.text} />
                </View>
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {category && <Text style={styles.categoryName}>{category.name}</Text>}
                <Text style={styles.itemSubText}>{formatFrequency(item)}</Text>
                <Text style={styles.walletText}>Desde: {wallet ? wallet.name : 'Billetera no encontrada'}</Text>
              </View>
              <View style={styles.itemRightSection}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                    <IconSymbol name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                    <IconSymbol name="trash" size={18} color={colors.notification} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemAmount}>
                  {{ USD: '$', VES: 'Bs.', USDT: 'USDT', EUR: '€' }[item.currency]} {item.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes gastos fijos definidos.</Text>}
      />
      <FixedExpenseModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingExpense}
        wallets={wallets}
      />
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setExpenseToDeleteId(null);
        }}
        onConfirm={confirmDeleteExpense}
        title="Eliminar Gasto Fijo"
        message="¿Estás seguro de que quieres eliminar este gasto fijo?"
        confirmText="Eliminar"
        type="destructive"
      />
    </View>
  );
}

const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    list: { flex: 1, width: '100%' },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 10,
    },
    iconContainer: { marginRight: 15 },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    categoryName: { fontSize: 14, color: colors.text, opacity: 0.7 },
    itemSubText: { fontSize: 14, color: colors.text, opacity: 0.7, marginVertical: 2 },
    walletText: { fontSize: 14, color: colors.primary, fontStyle: 'italic' },
    itemRightSection: { alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: 60 },
    itemAmount: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginTop: 4 },
    actionButtons: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    iconButton: {
      padding: 4,
      marginLeft: 8,
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.text, opacity: 0.6 },
  });
