import React, { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FixedExpenseModal from '../../components/FixedExpenseModal';
import Toast from '../../components/Toast';
import { FixedExpense } from '../../types';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useWallets } from '../../context/WalletsContext';
import { useCategories } from '../../context/CategoriesContext';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function FixedExpensesScreen() {
  const { expenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useFixedExpenses();
  const { wallets } = useWallets();
  const { categories } = useCategories();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
  };

  const handleAddNew = () => {
    if (wallets.length === 0) {
      Alert.alert("No hay billeteras", "Debes crear al menos una billetera antes de añadir un gasto fijo.");
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
    Alert.alert(
      'Eliminar Gasto Fijo',
      '¿Estás seguro de que quieres eliminar este gasto fijo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            deleteFixedExpense(id);
            showToast("Gasto fijo eliminado con éxito");
          }
        },
      ]
    );
  };

  const handleSubmit = (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    const isEditing = !!editingExpense;
    if (isEditing) {
      updateFixedExpense({ ...editingExpense, ...expenseData });
    } else {
      addFixedExpense(expenseData);
    }
    showToast(isEditing ? "Gasto fijo actualizado" : "Gasto fijo creado con éxito");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos Fijos</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const wallet = wallets.find(w => w.id === item.walletId);
          const category = categories.find(c => c.id === item.categoryId);
          return (
            <View style={styles.itemContainer}>
              {category && (
                <View style={styles.iconContainer}>
                  <IconSymbol name={category.icon as any} size={24} color="#1D3D47" />
                </View>
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {category && <Text style={styles.categoryName}>{category.name}</Text>}
                <Text style={styles.itemSubText}>Día {item.dayOfMonth} de cada mes</Text>
                <Text style={styles.walletText}>Desde: {wallet ? wallet.name : 'Billetera no encontrada'}</Text>
              </View>
              <View style={styles.itemRightSection}>
                <Text style={styles.itemAmount}>{{'USD':'$','VEF':'Bs.','USDT':'USDT'}[item.currency]} {item.amount.toFixed(2)}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes gastos fijos definidos.</Text>}
      />
      <View style={styles.buttonWrapper}>
        <Button title="Añadir Gasto Fijo" onPress={handleAddNew} />
      </View>
      <FixedExpenseModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingExpense}
        wallets={wallets}
      />
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        onHide={() => setToast({ isVisible: false, message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1D3D47' },
  list: { flex: 1, width: '100%' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10 },
  iconContainer: { marginRight: 15 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  categoryName: { fontSize: 14, color: '#666' },
  itemSubText: { fontSize: 14, color: '#666', marginVertical: 2 },
  walletText: { fontSize: 14, color: '#007bff', fontStyle: 'italic' },
  itemRightSection: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 18, fontWeight: 'bold', color: '#1D3D47' },
  itemActions: { flexDirection: 'row', marginTop: 5, gap: 15 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
  buttonWrapper: { paddingVertical: 10 },
});