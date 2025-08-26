import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router'; // Import useRouter
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TransactionModal from '../../components/TransactionModal';
import { IconSymbol } from '../../components/ui/IconSymbol'; // Import IconSymbol
import { BCV_RATE_KEY } from '../../constants/StorageKeys';
import { FixedExpense, Transaction, Wallet } from '../../types';
import { useWallets } from '../../hooks/useWallets';
import { useTransactions } from '../../hooks/useTransactions';
import { useFixedExpenses } from '../../hooks/useFixedExpenses';

// --- Constantes ---
const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

export default function FinanciaMeScreen() {
  // --- Hooks de Datos ---
  const { wallets, setWallets, isLoading: walletsLoading } = useWallets();
  const { transactions, setTransactions, addTransaction, isLoading: transactionsLoading, refreshTransactions } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();

  // --- Estados Locales ---
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [totalBalanceBs, setTotalBalanceBs] = useState(0);
  const [totalBalanceUsd, setTotalBalanceUsd] = useState(0);
  const [loading, setLoading] = useState(true); // Overall loading state
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  // activeWalletId is no longer needed as wallet is selected in modal
  const [toast, setToast] = useState({ isVisible: false, message: '' }); // For Toast component

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
  };

  const router = useRouter(); // Get router instance

  // --- Efectos ---
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  useEffect(() => {
    // Update overall loading state based on individual hook loading states
    setLoading(walletsLoading || transactionsLoading || fixedExpensesLoading || bcvRate === null);
  }, [walletsLoading, transactionsLoading, fixedExpensesLoading, bcvRate]);

  useEffect(() => {
    if (!loading && bcvRate) {
      recalculateTotals();
      checkDueFixedExpenses();
    }
  }, [loading, bcvRate, wallets, transactions, expenses]); // Recalculate when data or rate changes

  // --- Lógica de Carga ---
  const fetchBcvRate = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data && data.promedio) {
        const rate = data.promedio;
        setBcvRate(rate);
        await AsyncStorage.setItem(BCV_RATE_KEY, JSON.stringify(rate));
      }
    } catch (e) {
      console.error("DEBUG: Failed to fetch BCV rate", e);
      // No se establece un error fatal para permitir el uso offline
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await fetchBcvRate(); // Fetch current rate

      // Load rate from AsyncStorage as fallback if fetch fails or for offline use
      const storedRate = await AsyncStorage.getItem(BCV_RATE_KEY);
      if (storedRate) {
        setBcvRate(JSON.parse(storedRate));
      }
    } catch (e) {
      console.error("DEBUG: Failed to load initial data", e);
      setError('Failed to load initial data');
    } finally {
      setLoading(false); // Explicitly set loading to false here
    }
  };

  const recalculateTotals = () => {
    if (!bcvRate) return;
    let totalBs = 0;
    wallets.forEach(wallet => {
      totalBs += wallet.currency === 'BS' ? wallet.balance : wallet.balance * bcvRate;
    });
    setTotalBalanceBs(totalBs);
    setTotalBalanceUsd(totalBs / bcvRate);
  };

  // --- Lógica de Gastos Fijos ---
  const isWithinDateRange = (expense: FixedExpense, date: Date): boolean => {
    const start = expense.startDate ? new Date(expense.startDate) : null;
    const end = expense.endDate ? new Date(expense.endDate) : null;

    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  };

  const checkDueFixedExpenses = async () => {
    if (fixedExpensesLoading || walletsLoading) return; // Ensure data is loaded

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const dueExpenses = expenses.filter(exp => {
      const isDueByMonth = !exp.lastPaid || new Date(exp.lastPaid).getFullYear() < currentYear || new Date(exp.lastPaid).getMonth() < currentMonth;
      const isDueByDay = now.getDate() >= exp.dayOfMonth;
      
      return isDueByMonth && isDueByDay && isWithinDateRange(exp, now);
    });

    if (dueExpenses.length > 0) {
      promptToPayDueExpenses(dueExpenses);
    }
  };

  const promptToPayDueExpenses = (dueExpenses: FixedExpense[]) => {
    const expenseNames = dueExpenses.map(e => e.name).join(', ');
    Alert.alert(
      'Gastos Fijos Pendientes',
      `Tienes pagos pendientes para: ${expenseNames}. ¿Deseas pagarlos ahora?`,
      [
        { text: 'Más Tarde', style: 'cancel' },
        { text: 'Pagar Ahora', onPress: () => handlePayDueExpenses(dueExpenses) },
      ]
    );
  };

  const handlePayDueExpenses = async (dueExpenses: FixedExpense[]) => {
    if (!bcvRate) return;

    let tempWallets = [...wallets];
    let tempTransactions = [...transactions];
    let tempFixedExpenses = [...expenses]; // Use temp for fixed expenses too
    const nowString = new Date().toISOString();
    const paidExpensesIds: string[] = [];
    const failedExpenses: string[] = [];

    for (const expense of dueExpenses) {
      const wallet = tempWallets.find(w => w.id === expense.walletId);
      if (!wallet) {
        failedExpenses.push(`${expense.name} (Billetera no encontrada)`);
        continue;
      }

      let expenseCostInWalletCurrency: number;
      if (expense.currency === wallet.currency) {
          expenseCostInWalletCurrency = expense.amount;
      } else if (expense.currency === 'USD' && wallet.currency === 'BS') {
          expenseCostInWalletCurrency = expense.amount * bcvRate;
      } else if (expense.currency === 'BS' && wallet.currency === 'USD') {
          expenseCostInWalletCurrency = expense.amount / bcvRate;
      } else {
          // Fallback, should not happen with only BS/USD
          expenseCostInWalletCurrency = expense.amount;
      }

      if (wallet.balance >= expenseCostInWalletCurrency) {
        wallet.balance -= expenseCostInWalletCurrency;
        tempTransactions.unshift({
          id: `${Date.now()}-${expense.id}`,
          amount: expenseCostInWalletCurrency, // Use the converted amount for the transaction record
          description: `Gasto fijo: ${expense.name}`,
          type: 'expense',
          date: nowString,
          walletId: wallet.id,
        });
        paidExpensesIds.push(expense.id);
      } else {
        failedExpenses.push(`${expense.name} (Fondos insuficientes en ${wallet.name})`);
      }
    }

    // Update states via their setters from hooks
    setWallets(tempWallets);
    setTransactions(tempTransactions);
    setExpenses(tempFixedExpenses.map(exp =>
      paidExpensesIds.includes(exp.id) ? { ...exp, lastPaid: nowString } : exp
    ));
    refreshTransactions(); // Refresh transactions after paying fixed expenses

    let summaryMessage = paidExpensesIds.length > 0 ? `Pagos realizados con éxito para: ${dueExpenses.filter(e => paidExpensesIds.includes(e.id)).map(e => e.name).join(', ')}.` : '';
    if (failedExpenses.length > 0) {
      summaryMessage += `\n\nPagos fallidos: ${failedExpenses.join('; ')}.`;
    }
    Alert.alert("Resumen de Pagos", summaryMessage);
  };

  // --- Lógica de Transacciones Manuales ---
  const handleOpenModal = (type: 'income' | 'expense') => { // No longer needs walletId
    setTransactionType(type);
    setModalVisible(true);
  };

  const handleSubmitTransaction = (amount: number, description: string, walletId: string, category: string) => { // Receive walletId and category
    let wasTransactionSuccessful = false;
    const newWallets = wallets.map(wallet => {
      if (wallet.id === walletId) { // Use walletId from modal
        const newBalance = transactionType === 'income' ? wallet.balance + amount : wallet.balance - amount;
        if (newBalance < 0) {
          Alert.alert("Saldo Insuficiente", "La billetera no tiene fondos suficientes.");
          return wallet;
        }
        wasTransactionSuccessful = true;
        return { ...wallet, balance: newBalance };
      }
      return wallet;
    });

    if (wasTransactionSuccessful) {
      addTransaction({ // Use addTransaction from hook
        amount, description, date: new Date().toISOString(),
        type: transactionType,
        walletId: walletId, // Use walletId from modal
        category: category, // Add category
      });
      setWallets(newWallets);
      setModalVisible(false);
      refreshTransactions(); // Refresh transactions after adding a new one
    }
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
          <Text style={styles.balanceTitle}>Saldo Total Consolidado</Text>
          <Text style={styles.balanceBs}>Bs. {totalBalanceBs.toFixed(2)}</Text>
          <Text style={styles.balanceUsd}>≈ ${totalBalanceUsd.toFixed(2)} USD</Text>
        </View>

        <Text style={styles.sectionTitle}>Billeteras</Text>
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.walletItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBalance}>{item.currency === 'USD' ? '$' : 'Bs.'}{item.balance.toFixed(2)}</Text>
              </View>
              <View style={styles.walletActions}>
                <TouchableOpacity style={[styles.walletButton, styles.incomeButton]} onPress={() => handleOpenModal('income')}> 
                  <Text style={styles.walletButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.walletButton, styles.expenseButton]} onPress={() => handleOpenModal('expense')}> 
                  <Text style={styles.walletButtonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No has creado ninguna billetera.</Text>}
        />

        <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
        <FlatList
          data={transactions.slice(0, 5)} // Mostrar solo los últimos 5
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => {
            const wallet = wallets.find(w => w.id === item.walletId);
            return (
              <View style={styles.transactionItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
                  <Text style={styles.itemSubText}>{wallet ? wallet.name : 'Billetera eliminada'}</Text>
                  <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={[item.type === 'income' ? styles.incomeText : styles.expenseText, { flexShrink: 0 }]}>
                  {item.type === 'income' ? '+' : '-'} {wallet ? (wallet.currency === 'USD' ? '$' : 'Bs.') : ''} {item.amount.toFixed(2)}
                </Text>
              </View>
            )
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos recientes.</Text>}
        />
      </>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>FinanciaMe</Text>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => router.push('/categories')}
        >
          <Text style={{ color: 'gray', fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
      
      <TransactionModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitTransaction}
        type={transactionType}
        wallets={wallets} // Pass the wallets list
        showToast={showToast}
      />
    </KeyboardAvoidingView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20, // Add horizontal padding to align with content
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D3D47',
    // Remove textAlign: 'center' as it will be handled by flexbox
    marginBottom: 0, // Remove marginBottom as it's handled by titleContainer
  },
  settingsIcon: {
    padding: 5, // Add some padding around the icon for better touch area
  },
  headerContainer: { alignItems: 'center', marginBottom: 15, padding: 10, borderRadius: 10, backgroundColor: 'white', width: '100%' },
  bcvTitle: { fontSize: 18, color: '#666' },
  balanceContainer: { alignItems: 'center', marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: '#ffffff', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  balanceTitle: { fontSize: 20, color: '#1D3D47', fontWeight: 'bold' },
  balanceBs: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginTop: 5 },
  balanceUsd: { fontSize: 16, color: '#666', marginTop: 5 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3D47', marginTop: 10, marginBottom: 10, alignSelf: 'flex-start' },
  list: { flex: 1, width: '100%' },
  walletItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemBalance: { fontSize: 16, fontWeight: 'bold' },
  walletActions: { flexDirection: 'row', gap: 10 },
  walletButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  walletButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  incomeButton: { backgroundColor: '#28a745' },
  expenseButton: { backgroundColor: '#dc3545' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 5 },
  itemSubText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  itemDate: { fontSize: 10, color: '#999', marginTop: 2 }, // Added style for date
  incomeText: { color: '#28a745', fontWeight: 'bold' },
  expenseText: { color: '#dc3545', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
  
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  });
