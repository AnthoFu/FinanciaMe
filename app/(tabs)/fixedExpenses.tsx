import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FixedExpenseModal, { FixedExpense } from '../../components/FixedExpenseModal';

const FIXED_EXPENSES_KEY = 'fixedExpenses';

export default function FixedExpensesScreen() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);

  // Load expenses from storage
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const storedExpenses = await AsyncStorage.getItem(FIXED_EXPENSES_KEY);
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        }
      } catch (e) {
        console.error("Failed to load fixed expenses.", e);
      }
    };
    loadExpenses();
  }, []);

  // Save expenses to storage
  useEffect(() => {
    const saveExpenses = async () => {
      try {
        await AsyncStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(expenses));
      } catch (e) {
        console.error("Failed to save fixed expenses.", e);
      }
    };
    saveExpenses();
  }, [expenses]);

  const handleAddNew = () => {
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
          onPress: () => setExpenses(prev => prev.filter(exp => exp.id !== id))
        },
      ]
    );
  };

  const handleSubmit = (expenseData: Omit<FixedExpense, 'id'>) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(prev => 
        prev.map(exp => exp.id === editingExpense.id ? { ...exp, ...expenseData } : exp)
      );
    } else {
      // Add new expense
      const newExpense: FixedExpense = {
        id: Date.now().toString(),
        ...expenseData,
      };
      setExpenses(prev => [newExpense, ...prev]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos Fijos</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSubText}>Día {item.dayOfMonth} de cada mes</Text>
            </View>
            <View style={styles.itemRightSection}>
              <Text style={styles.itemAmount}>{item.currency === 'USD' ? '$' : 'Bs.'}{item.amount.toFixed(2)}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(item)}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes gastos fijos definidos.</Text>}
      />
      <Button title="Añadir Gasto Fijo" onPress={handleAddNew} />
      <FixedExpenseModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1D3D47' },
  list: { flex: 1, width: '100%' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemSubText: { fontSize: 14, color: '#666' },
  itemRightSection: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 18, fontWeight: 'bold', color: '#1D3D47' },
  itemActions: { flexDirection: 'row', marginTop: 5, gap: 15 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
});