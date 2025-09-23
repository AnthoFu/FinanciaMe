import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FixedExpenseModal from '../../components/FixedExpenseModal';
import { NotificationSettingsModal } from '../../components/NotificationSettingsModal';
import Toast from '../../components/Toast';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useCategories } from '../../context/CategoriesContext';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useWallets } from '../../context/WalletsContext';
import { useNotifications } from '../../hooks/useNotifications';
import { getThemedStyles } from '../../styles/themedStyles';
import { FixedExpense } from '../../types';

export default function FixedExpensesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);

  const { expenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useFixedExpenses();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const { notificationSettings, saveNotificationSettings } = useNotifications();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isNotificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
  };

  const handleAddNew = () => {
    if (wallets.length === 0) {
      Alert.alert('No hay billeteras', 'Debes crear al menos una billetera antes de añadir un gasto fijo.');
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
    Alert.alert('Eliminar Gasto Fijo', '¿Estás seguro de que quieres eliminar este gasto fijo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteFixedExpense(id);
          showToast('Gasto fijo eliminado con éxito');
        },
      },
    ]);
  };

  const handleSubmit = async (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const isEditing = !!editingExpense;
    try {
      if (isEditing) {
        await updateFixedExpense({ ...editingExpense, ...expenseData });
      } else {
        await addFixedExpense(expenseData);
      }
      showToast(isEditing ? 'Gasto fijo actualizado' : 'Gasto fijo creado con éxito');
    } catch (error) {
      showToast('Error al guardar el gasto fijo');
    }
  };

  const handleNotificationSettingsSave = async (settings: typeof notificationSettings) => {
    try {
      await saveNotificationSettings(settings);
      showToast('Configuración de notificaciones guardada');
    } catch (error) {
      showToast('Error al guardar la configuración');
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Gastos Fijos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setNotificationSettingsVisible(true)} style={styles.notificationButton}>
            <IconSymbol name="bell.fill" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddNew}>
            <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
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
                <Text style={styles.itemSubText}>Día {item.dayOfMonth} de cada mes</Text>
                <Text style={styles.walletText}>Desde: {wallet ? wallet.name : 'Billetera no encontrada'}</Text>
              </View>
              <View style={styles.itemRightSection}>
                <Text style={styles.itemAmount}>
                  {{ USD: '$', VEF: 'Bs.', USDT: 'USDT' }[item.currency]} {item.amount.toFixed(2)}
                </Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
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
      <NotificationSettingsModal
        isVisible={isNotificationSettingsVisible}
        onClose={() => setNotificationSettingsVisible(false)}
        settings={notificationSettings}
        onSave={handleNotificationSettingsSave}
      />
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onHide={() => setToast({ isVisible: false, message: '' })}
      />
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    list: { flex: 1, width: '100%' },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    notificationButton: {
      padding: 4,
    },
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
    itemRightSection: { alignItems: 'flex-end' },
    itemAmount: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    itemActions: { flexDirection: 'row', marginTop: 5, gap: 15 },
    actionText: { fontSize: 14, color: colors.primary },
    deleteText: { color: colors.notification },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.text, opacity: 0.6 },
  });
