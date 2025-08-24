import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TransactionModal from '../../components/TransactionModal'; // Ajusta la ruta si es necesario

// --- Tipos ---
interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
}

// --- Constantes ---
const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';
const BCV_RATE_KEY = 'bcvRate';
const BALANCE_KEY = 'userBalance';
const TRANSACTIONS_KEY = 'userTransactions';

export default function FinanciaMeScreen() {
  // --- Estados de la Aplicación ---
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de la UI
  const [isModalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  // --- Efectos ---

  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedRate = await AsyncStorage.getItem(BCV_RATE_KEY);
        if (storedRate) setBcvRate(JSON.parse(storedRate));

        const storedBalance = await AsyncStorage.getItem(BALANCE_KEY);
        if (storedBalance) setBalance(JSON.parse(storedBalance));

        const storedTransactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

      } catch (e) { console.error("DEBUG: Failed to load data from storage", e); }

      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const data = await response.json();
          const newRate = data.promedio;
          setBcvRate(newRate);
          await AsyncStorage.setItem(BCV_RATE_KEY, JSON.stringify(newRate));
        } else {
          if (!bcvRate) throw new Error('La red no responde y no hay datos locales.');
        }
      } catch (e: any) {
        console.error("DEBUG: Failed to fetch rate from API", e);
        if (!bcvRate) setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Guarda el saldo cuando cambia
  useEffect(() => {
    const saveBalance = async () => {
      try {
        await AsyncStorage.setItem(BALANCE_KEY, JSON.stringify(balance));
      } catch (e) {
        console.error("DEBUG: Failed to save balance.", e);
      }
    };
    // No guardar el estado inicial 0 si no es intencional
    if (!loading) {
      saveBalance();
    }
  }, [balance, loading]);

  // Guarda las transacciones cuando cambian
  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      } catch (e) {
        console.error("DEBUG: Failed to save transactions.", e);
      }
    };
    if (!loading) {
      saveTransactions();
    }
  }, [transactions, loading]);

  // Recalcula el saldo en USD
  useEffect(() => {
    if (bcvRate && balance) setBalanceUSD(balance / bcvRate);
    else setBalanceUSD(0);
  }, [balance, bcvRate]);

  // --- Lógica de Negocio ---

  const handleOpenModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setModalVisible(true);
  };

  const handleSubmitTransaction = (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      description,
      type: transactionType,
      date: new Date().toISOString(),
    };

    const newBalance = transactionType === 'income' ? balance + amount : balance - amount;
    
    if (newBalance < 0) {
      Alert.alert("Saldo Insuficiente", "No puedes registrar un gasto que te deje en negativo.");
      return;
    }

    setBalance(newBalance);
    setTransactions(prev => [newTransaction, ...prev]);
    setModalVisible(false);
  };

  // --- Renderizado ---

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.bcvTitle}>Tasa BCV: {bcvRate ? `Bs. ${bcvRate.toFixed(2)}` : 'N/A'}</Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Tu Saldo</Text>
          <Text style={styles.balanceBs}>Bs. {balance.toFixed(2)}</Text>
          <Text style={styles.balanceUsd}>≈ ${balanceUSD.toFixed(2)} USD</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.incomeButton]} onPress={() => handleOpenModal('income')}>
            <Text style={styles.actionButtonText}>+ Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.expenseButton]} onPress={() => handleOpenModal('expense')}>
            <Text style={styles.actionButtonText}>- Gasto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>Historial de Movimientos</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyItemDesc}>{item.description}</Text>
                <Text style={styles.historyItemDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <Text style={item.type === 'income' ? styles.incomeText : styles.expenseText}>
                {item.type === 'income' ? '+' : '-'} Bs. {item.amount.toFixed(2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyHistory}>No hay movimientos registrados.</Text>}
        />
      </>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={styles.title}>FinanciaMe</Text>
      {renderContent()}
      <TransactionModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitTransaction}
        type={transactionType}
      />
    </KeyboardAvoidingView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1D3D47' },
  headerContainer: { alignItems: 'center', marginBottom: 15, padding: 10, borderRadius: 10, backgroundColor: 'white', width: '100%' },
  bcvTitle: { fontSize: 18, color: '#666' },
  balanceContainer: { alignItems: 'center', marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: '#ffffff', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  balanceTitle: { fontSize: 20, color: '#1D3D47', fontWeight: 'bold' },
  balanceBs: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginTop: 5 },
  balanceUsd: { fontSize: 16, color: '#666', marginTop: 5 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, width: '100%' },
  actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  incomeButton: { backgroundColor: '#28a745' },
  expenseButton: { backgroundColor: '#dc3545' },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3D47', marginBottom: 10, alignSelf: 'flex-start' },
  historyList: { width: '100%' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  historyItemDesc: { fontSize: 16, fontWeight: '500' },
  historyItemDate: { fontSize: 12, color: '#666' },
  incomeText: { color: '#28a745', fontWeight: 'bold' },
  expenseText: { color: '#dc3545', fontWeight: 'bold' },
  emptyHistory: { textAlign: 'center', color: '#666', marginTop: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});
