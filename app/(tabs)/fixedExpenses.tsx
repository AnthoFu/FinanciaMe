import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import FixedExpenseModal, { FixedExpense } from '../../components/FixedExpenseModal';
import { Wallet } from '../../components/WalletModal';

const FIXED_EXPENSES_KEY = 'fixedExpenses';
const WALLETS_KEY = 'userWallets';

export default function FixedExpensesScreen() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedExpenses = await AsyncStorage.getItem(FIXED_EXPENSES_KEY);
          if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

          const storedWallets = await AsyncStorage.getItem(WALLETS_KEY);
          if (storedWallets) setWallets(JSON.parse(storedWallets));
        } catch (e) {
          console.error("Failed to load data.", e);
        }
      };
      loadData();
    }, [])
  );

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
          onPress: () => setExpenses(prev => prev.filter(exp => exp.id !== id))
        },
      ]
    );
  };

  const handleSubmit = (expenseData: Omit<FixedExpense, 'id' | 'lastPaid'>) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(prev => 
        prev.map(exp => exp.id === editingExpense.id ? { ...exp, ...expenseData } : exp)
      );
    } else {
      // Add new expense
      const newExpense: FixedExpense = {
        id: Date.now().toString(),
        lastPaid: undefined, // Ensure new expenses can be paid this month
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
        renderItem={({ item }) => {
          const wallet = wallets.find(w => w.id === item.walletId);
          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSubText}>Día {item.dayOfMonth} de cada mes</Text>
                <Text style={styles.walletText}>Desde: {wallet ? wallet.name : 'Billetera no encontrada'}</Text>
              </View>
              <View style={styles.itemRightSection}>
                <Text style={styles.itemAmount}>{item.currency === 'USD' ? '$' : 'Bs.'}{item.amount.toFixed(2)}</Text>
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
      <Button title="Añadir Gasto Fijo" onPress={handleAddNew} />
      <FixedExpenseModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingExpense}
        wallets={wallets}
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
  itemSubText: { fontSize: 14, color: '#666', marginVertical: 2 },
  walletText: { fontSize: 14, color: '#007bff', fontStyle: 'italic' },
  itemRightSection: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 18, fontWeight: 'bold', color: '#1D3D47' },
  itemActions: { flexDirection: 'row', marginTop: 5, gap: 15 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
});
