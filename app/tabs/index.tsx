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
import { useTransactionHandler } from '../../hooks/useTransactionHandler';
import { getThemedStyles } from '../../styles/themedStyles';
import { Transaction } from '../../types';

export default function FinanciaMeScreen() {
  const { colors } = useTheme();
  const styles = getThemedStyles(colors);

  // --- Data Hooks ---
  const { wallets, setWallets, isLoading: walletsLoading } = useWallets();
  const { transactions, setTransactions, deleteTransaction, isLoading: transactionsLoading } = useTransactions();
  const { expenses, setExpenses, isLoading: fixedExpensesLoading } = useFixedExpenses();
  const { bcvRate, usdtRate, averageRate, loading: ratesLoading, error: ratesError } = useExchangeRates();
  const balances = useFinancialSummary(wallets, bcvRate, usdtRate, averageRate, ratesLoading);
  const { handleSaveTransaction, handleTransfer } = useTransactionHandler();

  // --- Fixed Expenses Logic ---
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

  // --- Local State ---
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedWalletIdForModal, setSelectedWalletIdForModal] = useState<string | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const showToast = (message: string) => setToast({ isVisible: true, message });
  const router = useRouter();

  // --- Effects ---
  useEffect(() => {
    setLoading(walletsLoading || transactionsLoading || fixedExpensesLoading || ratesLoading);
  }, [walletsLoading, transactionsLoading, fixedExpensesLoading, ratesLoading]);

  useEffect(() => {
    if (!loading) {
      checkDueFixedExpenses();
    }
  }, [loading, checkDueFixedExpenses]);

  // --- Transaction Logic ---
  const handleOpenModal = (type: 'income' | 'expense', walletId: string) => {
    setTransactionType(type);
    setSelectedWalletIdForModal(walletId);
    setTransactionToEdit(null);
    setModalVisible(true);
  };

  const handleSubmitTransaction = (
    amount: number,
    description: string,
    walletId: string,
    categoryId: string,
    type: 'income' | 'expense',
    transactionToUpdate?: Transaction,
  ) => {
    const success = handleSaveTransaction(amount, description, walletId, categoryId, type, transactionToUpdate);
    if (success) {
      setModalVisible(false);
      setTransactionToEdit(null);
      showToast(transactionToUpdate ? 'Movimiento actualizado' : 'Movimiento añadido');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setModalVisible(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert('Eliminar Movimiento', '¿Estás seguro de que quieres eliminar este movimiento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          // Revert balance
          const wallet = wallets.find((w) => w.id === transaction.walletId);
          if (wallet) {
            const newBalance =
              transaction.type === 'income' ? wallet.balance - transaction.amount : wallet.balance + transaction.amount;
            setWallets(wallets.map((w) => (w.id === wallet.id ? { ...w, balance: newBalance } : w)));
          }
          deleteTransaction(transaction.id);
          showToast('Movimiento eliminado');
        },
      },
    ]);
  };

  const handleTransferSubmit = (fromWalletId: string, toWalletId: string, fromAmount: number, toAmount: number) => {
    try {
      const success = handleTransfer(fromWalletId, toWalletId, fromAmount, toAmount);
      if (success) {
        setTransferModalVisible(false);
        showToast('Transferencia realizada con éxito');
      }
    } catch (error: any) {
      showToast(error.message);
    }
  };

  // --- Render ---
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
    if (ratesError) return <Text style={styles.errorText}>Error cargando tasas: {ratesError}</Text>;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <SummaryCard balances={balances} bcvRate={bcvRate} usdtRate={usdtRate} averageRate={averageRate} />
        <WalletsCarousel wallets={wallets} onOpenModal={handleOpenModal} />
        <RecentTransactionsList
          transactions={transactions}
          wallets={wallets}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
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
        onClose={() => {
          setModalVisible(false);
          setTransactionToEdit(null);
        }}
        onSubmit={handleSubmitTransaction}
        type={transactionType}
        wallets={wallets}
        showToast={showToast}
        initialWalletId={selectedWalletIdForModal}
        transactionToEdit={transactionToEdit}
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
