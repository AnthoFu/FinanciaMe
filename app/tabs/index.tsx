import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import TransferModal from '../../components/TransferModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { useFinancialSummary } from '../../hooks/useFinancialSummary';
import { useFixedExpensesHandler } from '../../hooks/useFixedExpensesHandler';
import { getThemedStyles } from '../../styles/themedStyles';

export default function FinanciaMeScreen() {
  const { colors } = useTheme();
  const styles = getThemedStyles(colors);

  // --- Hooks de Datos ---
  const { wallets, setWallets, isLoading: walletsLoading, updateBalancesForTransfer } = useWallets();
  const {
    transactions,
    setTransactions,
    addTransaction,
    addTransfer,
    isLoading: transactionsLoading,
  } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();
  const { bcvRate, usdtRate, averageRate, loading: ratesLoading, error: ratesError } = useExchangeRates();
  const balances = useFinancialSummary(wallets, bcvRate, usdtRate, averageRate, ratesLoading);

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
    averageRate,
    fixedExpensesLoading,
    walletsLoading,
    ratesLoading,
  });

  // --- Estados Locales ---
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
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

  const handleTransferSubmit = (
    fromWalletId: string,
    toWalletId: string,
    fromAmount: number,
    toAmount: number,
    rate: number,
  ) => {
    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      showToast('Error: No se encontraron las billeteras.');
      return;
    }

    // 1. Update wallet balances
    updateBalancesForTransfer(fromWalletId, toWalletId, fromAmount, toAmount);

    // 2. Add the two transactions
    addTransfer({
      fromWalletId,
      toWalletId,
      fromAmount,
      toAmount,
      fromWalletName: fromWallet.name,
      toWalletName: toWallet.name,
      date: new Date().toISOString(),
    });

    setTransferModalVisible(false);
    showToast('Transferencia realizada con éxito');
  };

  // --- Renderizado ---
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
    if (ratesError) return <Text style={styles.errorText}>Error cargando tasas: {ratesError}</Text>;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <SummaryCard balances={balances} bcvRate={bcvRate} usdtRate={usdtRate} averageRate={averageRate} />
        <WalletsCarousel wallets={wallets} onOpenModal={handleOpenModal} />
        <RecentTransactionsList transactions={transactions} wallets={wallets} />
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FinanciaMe</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => setTransferModalVisible(true)}>
            <IconSymbol name="arrow.left.arrow.right.circle.fill" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <IconSymbol name="gearshape.fill" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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
      <TransferModal
        isVisible={isTransferModalVisible}
        onClose={() => setTransferModalVisible(false)}
        onSubmit={handleTransferSubmit}
        showToast={showToast}
      />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        onHide={() => setToast({ isVisible: false, message: '' })}
      />
    </KeyboardAvoidingView>
  );
}
