import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TransactionModal from '../../components/TransactionModal';
import { useWallets } from '../../context/WalletsContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { FixedExpense, Wallet } from '../../types';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VEF' | 'USDT') => {
  switch (currency) {
    case 'USD': return '$';
    case 'VEF': return 'Bs.';
    case 'USDT': return 'USDT';
    default: return '';
  }
};

export default function FinanciaMeScreen() {
  // --- Hooks de Datos ---
  const { wallets, setWallets, isLoading: walletsLoading } = useWallets();
  const { transactions, setTransactions, addTransaction, isLoading: transactionsLoading } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();
  const { bcvRate, usdtRate, averageRate, loading: ratesLoading, error: ratesError } = useExchangeRates();

  // --- Estados Locales ---
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
  };

  const router = useRouter();

  // --- Efectos ---
  useEffect(() => {
    setLoading(walletsLoading || transactionsLoading || fixedExpensesLoading || ratesLoading);
  }, [walletsLoading, transactionsLoading, fixedExpensesLoading, ratesLoading]);

  useEffect(() => {
    if (!loading) {
      checkDueFixedExpenses();
    }
  }, [loading, wallets, transactions, expenses, bcvRate, usdtRate]);

  // --- Lógica de Balances (Fase 3 y 4) ---
  const balances = useMemo(() => {
    if (ratesLoading || !bcvRate || !usdtRate) {
      return {
        consolidatedBcv: 0,
        consolidatedUsdt: 0,
        byCurrency: { VEF: 0, USD: 0, USDT: 0 },
      };
    }

    const byCurrency = wallets.reduce((acc, wallet) => {
      acc[wallet.currency] = (acc[wallet.currency] || 0) + wallet.balance;
      return acc;
    }, { VEF: 0, USD: 0, USDT: 0 } as Record<'VEF' | 'USD' | 'USDT', number>);

    const consolidatedBcv = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VEF') return total + (wallet.balance / bcvRate);
      return total + wallet.balance;
    }, 0);

    const consolidatedUsdt = wallets.reduce((total, wallet) => {
      if (wallet.currency === 'VEF') return total + (wallet.balance / usdtRate);
      return total + wallet.balance;
    }, 0);

    return { consolidatedBcv, consolidatedUsdt, byCurrency };
  }, [wallets, bcvRate, usdtRate, ratesLoading]);

  // --- Lógica de Gastos Fijos ---
  const isWithinDateRange = (expense: FixedExpense, date: Date): boolean => {
    const start = expense.startDate ? new Date(expense.startDate) : null;
    const end = expense.endDate ? new Date(expense.endDate) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

  const checkDueFixedExpenses = async () => {
    if (fixedExpensesLoading || walletsLoading || ratesLoading) return;

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
      [{ text: 'Más Tarde', style: 'cancel' }, { text: 'Pagar Ahora', onPress: () => handlePayDueExpenses(dueExpenses) }]
    );
  };

  const handlePayDueExpenses = async (dueExpenses: FixedExpense[]) => {
    if (!bcvRate || !usdtRate) return;

    let tempWallets = [...wallets];
    let tempTransactions = [...transactions];
    let tempFixedExpenses = [...expenses];
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
      } else if (expense.currency === 'USD' && wallet.currency === 'VEF') {
        expenseCostInWalletCurrency = expense.amount * bcvRate;
      } else if (expense.currency === 'VEF' && wallet.currency === 'USD') {
        expenseCostInWalletCurrency = expense.amount / bcvRate;
      } else { 
        expenseCostInWalletCurrency = expense.amount;
      }

      if (wallet.balance >= expenseCostInWalletCurrency) {
        wallet.balance -= expenseCostInWalletCurrency;
        tempTransactions.unshift({
          id: `${Date.now()}-${expense.id}`,
          amount: expenseCostInWalletCurrency,
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

    setWallets(tempWallets);
    setTransactions(tempTransactions);
    setExpenses(tempFixedExpenses.map(exp => paidExpensesIds.includes(exp.id) ? { ...exp, lastPaid: nowString } : exp));

    let summaryMessage = paidExpensesIds.length > 0 ? `Pagos realizados: ${dueExpenses.filter(e => paidExpensesIds.includes(e.id)).map(e => e.name).join(', ')}.` : '';
    if (failedExpenses.length > 0) {
      summaryMessage += `

Pagos fallidos: ${failedExpenses.join('; ')}.`;
    }
    Alert.alert("Resumen de Pagos", summaryMessage);
  };

  // --- Lógica de Transacciones Manuales ---
  const handleOpenModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setModalVisible(true);
  };

  const handleSubmitTransaction = (amount: number, description: string, walletId: string, category: string) => {
    let wasTransactionSuccessful = false;
    const newWallets = wallets.map(wallet => {
      if (wallet.id === walletId) {
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
      addTransaction({
        amount, description, date: new Date().toISOString(),
        type: transactionType,
        walletId: walletId,
        category: category,
      });
      setWallets(newWallets);
      setModalVisible(false);
    }
  };

  // --- Renderizado ---
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (ratesError) return <Text style={styles.errorText}>Error cargando tasas: {ratesError}</Text>;

    return (
      <>
        {/* Rates Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tasas de Referencia</Text>
          <View style={styles.ratesCard}>
            <View style={styles.rateItem}>
              <Text style={styles.rateName}>BCV</Text>
              <Text style={styles.rateValue}>Bs. {bcvRate.toFixed(2)}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateName}>Binance USDT</Text>
              <Text style={styles.rateValue}>Bs. {usdtRate.toFixed(2)}</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={styles.rateName}>Promedio</Text>
              <Text style={styles.rateValue}>Bs. {averageRate.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Balances Section (Phase 3 y 4) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Saldos Consolidados</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceName}>Total (ref. BCV)</Text>
              <Text style={styles.balanceValue}>$ {balances.consolidatedBcv.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceName}>Total (ref. Binance)</Text>
              <Text style={styles.balanceValue}>$ {balances.consolidatedUsdt.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Saldos por Moneda</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceName}>Bolívares (VEF)</Text>
              <Text style={styles.balanceValue}>{getCurrencySymbol('VEF')} {(balances.byCurrency.VEF || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceName}>Dólares (USD)</Text>
              <Text style={styles.balanceValue}>{getCurrencySymbol('USD')} {(balances.byCurrency.USD || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceName}>Tether (USDT)</Text>
              <Text style={styles.balanceValue}>{getCurrencySymbol('USDT')} {(balances.byCurrency.USDT || 0).toFixed(2)}</Text>
            </View>
          </View>
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
                <Text style={styles.itemBalance}>{getCurrencySymbol(item.currency)}{item.balance.toFixed(2)}</Text>
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
          data={transactions.slice(0, 5)}
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
                  {item.type === 'income' ? '+' : '-'} {wallet ? getCurrencySymbol(wallet.currency) : ''} {item.amount.toFixed(2)}
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
        wallets={wallets}
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D3D47',
  },
  settingsIcon: {
    padding: 5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  ratesCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rateItem: {
    alignItems: 'center',
  },
  rateName: {
    fontSize: 14,
    color: '#666',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  balanceName: {
    fontSize: 16,
    color: '#333',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3D47', marginBottom: 10 },
  list: { width: '100%' },
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
  itemDate: { fontSize: 10, color: '#999', marginTop: 2 },
  incomeText: { color: '#28a745', fontWeight: 'bold' },
  expenseText: { color: '#dc3545', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});