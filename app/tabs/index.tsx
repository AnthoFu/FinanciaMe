import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RecentTransactionsList } from '../../components/home/RecentTransactionsList';
import { SummaryCard } from '../../components/home/SummaryCard';
import { WalletsCarousel } from '../../components/home/WalletsCarousel';
import TransactionModal from '../../components/TransactionModal';
import TransferModal from '../../components/TransferModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useFixedExpenses } from '../../context/FixedExpensesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { useFinancialSummary } from '../../hooks/useFinancialSummary';
import { useFixedExpensesHandler } from '../../hooks/useFixedExpensesHandler';
import { useToast } from '@/hooks/useToast';
import { useTransactionHandler } from '../../hooks/useTransactionHandler';
import { getThemedStyles } from '../../styles/themedStyles';
import { Transaction } from '../../types';
import { usePrivacyStore } from '@/store/privacyStore';

export default function FinanciaMeScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = getThemedStyles(colors);
  const { isBalancesHidden, toggleBalancesHidden } = usePrivacyStore();

  // --- Data Hooks ---
  const { wallets, isLoading: walletsLoading, revertTransactionBalance } = useWallets();
  const { transactions, deleteTransaction, isLoading: transactionsLoading } = useTransactions();
  const { isLoading: fixedExpensesLoading } = useFixedExpenses();
  const {
    bcvRate,
    usdtRate,
    eurRate,
    averageRate,
    loading: ratesLoading,
    error: ratesError,
    refreshRates,
    isRefreshing: ratesRefreshing,
    lastUpdated,
  } = useExchangeRates();
  const summary = useFinancialSummary(wallets, bcvRate, usdtRate, eurRate, averageRate, ratesLoading);
  const { handleSaveTransaction, handleTransfer } = useTransactionHandler();

  // --- Fixed Expenses Logic ---
  const { checkDueFixedExpenses } = useFixedExpensesHandler();

  // --- Local State ---
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedWalletIdForModal, setSelectedWalletIdForModal] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const router = useRouter();

  // --- Effects ---
  useEffect(() => {
    // Only show global loading if we don't have essential data yet
    setLoading(walletsLoading || transactionsLoading || fixedExpensesLoading || (ratesLoading && bcvRate === 0));
  }, [walletsLoading, transactionsLoading, fixedExpensesLoading, ratesLoading, bcvRate]);

  useEffect(() => {
    if (!loading) {
      checkDueFixedExpenses();
    }
  }, [loading, checkDueFixedExpenses]);

  // --- Transaction Logic ---
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
  };

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
    commission?: number,
    date?: string,
  ) => {
    const success = handleSaveTransaction(
      amount,
      description,
      walletId,
      categoryId,
      type,
      transactionToUpdate,
      commission,
      date,
    );
    if (success) {
      setModalVisible(false);
      setTransactionToEdit(null);
      showToast({ message: transactionToUpdate ? 'Movimiento actualizado' : 'Movimiento añadido', type: 'success' });
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
          const result = revertTransactionBalance(transaction);
          if (result.success) {
            deleteTransaction(transaction.id);
            showToast({ message: 'Movimiento eliminado', type: 'success' });
          } else {
            Alert.alert('Error', result.error || 'No se pudo eliminar el movimiento.');
          }
        },
      },
    ]);
  };

  const handleTransferSubmit = (
    fromWalletId: string,
    toWalletId: string,
    fromAmount: number,
    toAmount: number,
    rate: number,
    commission?: number,
  ) => {
    try {
      const success = handleTransfer(fromWalletId, toWalletId, fromAmount, toAmount, commission);
      if (success) {
        setTransferModalVisible(false);
        showToast({ message: 'Transferencia realizada con éxito', type: 'success' });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  // --- Render ---
  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;

    // Solo mostramos error si no hay tasas en absoluto (bcvRate === 0)
    if (ratesError && bcvRate === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={[styles.errorText, { textAlign: 'center' }]}>
            No se pudieron obtener las tasas de cambio: {ratesError}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{ marginTop: 20, padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}
          >
            <Text style={{ color: 'white' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || ratesRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <SummaryCard
          balances={summary.regular}
          savings={summary.savings}
          bcvRate={bcvRate}
          usdtRate={usdtRate}
          eurRate={eurRate}
          averageRate={averageRate}
          lastUpdated={lastUpdated}
        />
        <WalletsCarousel wallets={wallets.filter((w) => !w.isSavings)} onOpenModal={handleOpenModal} />
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
        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleBalancesHidden}>
            <IconSymbol name={isBalancesHidden ? 'eye.slash.fill' : 'eye.fill'} size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTransferModalVisible(true)}>
            <IconSymbol name="arrow.left.arrow.right.circle.fill" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
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
        initialWalletId={selectedWalletIdForModal}
        transactionToEdit={transactionToEdit}
      />
      <TransferModal
        isVisible={isTransferModalVisible}
        onClose={() => setTransferModalVisible(false)}
        onSubmit={handleTransferSubmit}
      />
    </KeyboardAvoidingView>
  );
}
