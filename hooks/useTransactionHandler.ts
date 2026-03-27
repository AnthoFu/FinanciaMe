import { Alert } from 'react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useWallets } from '../context/WalletsContext';
import { Transaction } from '../types';

export function useTransactionHandler() {
  const { wallets, updateBalancesForTransaction, updateBalancesForTransfer } = useWallets();
  const { addTransaction, updateTransaction, addTransfer } = useTransactions();

  const handleSaveTransaction = (
    amount: number,
    description: string,
    walletId: string,
    categoryId: string,
    type: 'income' | 'expense',
    transactionToUpdate?: Transaction,
    commission: number = 0,
  ): boolean => {
    // 1. Update balances first (centralized logic)
    const result = updateBalancesForTransaction(amount, type, walletId, transactionToUpdate, commission);

    if (!result.success) {
      Alert.alert('Operación Fallida', result.error || 'No se pudo procesar la transacción.');
      return false;
    }

    // 2. If balance update was successful, update transaction records
    if (transactionToUpdate) {
      const updatedTransaction: Transaction = {
        ...transactionToUpdate,
        amount,
        description,
        walletId,
        categoryId,
        type,
        commission,
      };
      updateTransaction(updatedTransaction);
    } else {
      addTransaction({
        amount,
        description,
        date: new Date().toISOString(),
        type,
        walletId,
        categoryId,
        commission,
      });
    }

    return true;
  };

  const handleTransfer = (
    fromWalletId: string,
    toWalletId: string,
    fromAmount: number,
    toAmount: number,
    commission: number = 0,
  ) => {
    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      Alert.alert('Error', 'No se encontraron las billeteras.');
      return false;
    }

    // 1. Update balances first (centralized logic)
    // For transfer, commission is added to the amount deducted from the source wallet
    const result = updateBalancesForTransfer(fromWalletId, toWalletId, fromAmount + commission, toAmount);

    if (!result.success) {
      Alert.alert('Transferencia Fallida', result.error || 'No se pudo procesar la transferencia.');
      return false;
    }

    // 2. If successful, add the two transactions for the transfer record
    addTransfer({
      fromWalletId,
      toWalletId,
      fromAmount,
      toAmount,
      fromWalletName: fromWallet.name,
      toWalletName: toWallet.name,
      date: new Date().toISOString(),
      commission,
    });

    return true;
  };

  return { handleSaveTransaction, handleTransfer };
}
