import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RecentTransactionsList } from '../../components/home/RecentTransactionsList';
import { SummaryCard } from '../../components/home/SummaryCard';
import { WalletsCarousel } from '../../components/home/WalletsCarousel';
import Toast from '../../components/Toast';
import TransactionModal from '../../components/TransactionModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { useFinancialSummary } from '../../hooks/useFinancialSummary';
import { useFixedExpensesHandler } from '../../hooks/useFixedExpensesHandler';
import { styles } from '../../styles/styles';

export default function FinanciaMeScreen() {
  // --- Hooks de Datos ---
  const { wallets, setWallets, isLoading: walletsLoading } = useWallets();
  const { transactions, setTransactions, addTransaction, isLoading: transactionsLoading } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();
  const { bcvRate, usdtRate, loading: ratesLoading, error: ratesError } = useExchangeRates();
  const balances = useFinancialSummary(wallets, bcvRate, usdtRate, ratesLoading);

  // --- Lógica de Gastos Fijos ---
  const { checkDueFixedExpenses } = useFixedExpensesHandler({
    wallets,
    setWallets,
    transactions,
    setTransactions,
    expenses,
    setExpenses,
    bcvRate,
    usdtRate,
    fixedExpensesLoading,
    walletsLoading,
    ratesLoading,
  });

  // --- Estados Locales ---
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedWalletIdForModal, setSelectedWalletIdForModal] = useState<string | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = (message: string) => setToast({ isVisible: true, message });
  const router = useRouter();

  // --- Efectos ---
  useEffect(() => {
    setLoading(walletsLoading || transactionsLoading || fixedExpensesLoading || ratesLoading);
  }, [walletsLoading, transactionsLoading, fixedExpensesLoading, ratesLoading]);

  useEffect(() => {
    if (!loading) {
      checkDueFixedExpenses();
    }
  }, [loading, checkDueFixedExpenses]);

  // --- Lógica de Transacciones Manuales ---
  const handleOpenModal = (type: 'income' | 'expense', walletId: string) => {
    setTransactionType(type);
    setSelectedWalletIdForModal(walletId);
    setModalVisible(true);
  };

  const handleSubmitTransaction = (amount: number, description: string, walletId: string, categoryId: string) => {
    let wasTransactionSuccessful = false;
    const newWallets = wallets.map((wallet) => {
      if (wallet.id === walletId) {
        const newBalance = transactionType === 'income' ? wallet.balance + amount : wallet.balance - amount;
        if (newBalance < 0) {
          Alert.alert('Saldo Insuficiente', 'La billetera no tiene fondos suficientes.');
          return wallet;
        }
        wasTransactionSuccessful = true;
        return { ...wallet, balance: newBalance };
      }
      return wallet;
    });
    if (wasTransactionSuccessful) {
      addTransaction({
        amount,
        description,
        date: new Date().toISOString(),
        type: transactionType,
        walletId: walletId,
        categoryId: categoryId,
      });
      setWallets(newWallets);
      setModalVisible(false);
    }
  };

  // --- Renderizado ---
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;
    if (ratesError) return <Text style={styles.errorText}>Error cargando tasas: {ratesError}</Text>;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <SummaryCard balances={balances} bcvRate={bcvRate} usdtRate={usdtRate} />
        <WalletsCarousel wallets={wallets} onOpenModal={handleOpenModal} />
        <RecentTransactionsList transactions={transactions} wallets={wallets} />
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FinanciaMe</Text>
        <TouchableOpacity onPress={() => router.push('/categories')}>
          <IconSymbol name="gearshape.fill" size={24} color="#1D3D47" />
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
        initialWalletId={selectedWalletIdForModal}
      />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        onClose={() => setToast({ isVisible: false, message: '' })}
      />
    </KeyboardAvoidingView>
  );
}
