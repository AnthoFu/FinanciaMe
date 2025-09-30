import { Alert } from 'react-native';
import { useTransactions } from '../context/TransactionsContext';
import { useWallets } from '../context/WalletsContext';

export function useTransactionHandler() {
  const { wallets, setWallets, updateBalancesForTransfer } = useWallets();
  const { addTransaction, addTransfer } = useTransactions();

  const handleNewTransaction = (
    amount: number,
    description: string,
    walletId: string,
    categoryId: string,
    type: 'income' | 'expense',
  ): boolean => {
    let wasTransactionSuccessful = false;
    const newWallets = wallets.map((wallet) => {
      if (wallet.id === walletId) {
        const newBalance = type === 'income' ? wallet.balance + amount : wallet.balance - amount;
        if (newBalance < 0) {
          Alert.alert('Saldo Insuficiente', 'La billetera no tiene fondos suficientes.');
          return wallet; // Return original wallet
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
        type,
        walletId,
        categoryId,
      });
      setWallets(newWallets);
    }
    return wasTransactionSuccessful;
  };

  const handleTransfer = (fromWalletId: string, toWalletId: string, fromAmount: number, toAmount: number) => {
    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      throw new Error('Error: No se encontraron las billeteras.');
    }

    if (fromWallet.balance < fromAmount) {
      Alert.alert('Saldo Insuficiente', `La billetera "${fromWallet.name}" no tiene fondos suficientes.`);
      return false;
    }

    // 1. Update wallet balances
    updateBalancesForTransfer(fromWalletId, toWalletId, fromAmount, toAmount);

    // 2. Add the two transactions for the transfer
    addTransfer({
      fromWalletId,
      toWalletId,
      fromAmount,
      toAmount,
      fromWalletName: fromWallet.name,
      toWalletName: toWallet.name,
      date: new Date().toISOString(),
    });

    return true;
  };

  return { handleNewTransaction, handleTransfer };
}
