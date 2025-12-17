import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionsContextType } from '../types';
import { TRANSACTIONS_KEY } from '../constants/StorageKeys';

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const storedTransactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (e) {
      console.error('[loadTransactions] Error al cargar las transacciones:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveTransactions = async () => {
        try {
          await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
        } catch (e) {
          console.error('[saveTransactions] Error al guardar las transacciones:', e);
        }
      };
      saveTransactions();
    }
  }, [transactions, isLoading]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...transactionData,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addTransfer = (transferData: {
    fromWalletId: string;
    toWalletId: string;
    fromAmount: number;
    toAmount: number;
    fromWalletName: string;
    toWalletName: string;
    date: string;
  }) => {
    const transferId = Date.now().toString();
    const expenseTransaction: Transaction = {
      id: `t_${transferId}_exp`,
      amount: transferData.fromAmount,
      description: `Transferencia a ${transferData.toWalletName}`,
      date: transferData.date,
      type: 'expense',
      walletId: transferData.fromWalletId,
      categoryId: 'transfer-out',
    };

    const incomeTransaction: Transaction = {
      id: `t_${transferId}_inc`,
      amount: transferData.toAmount,
      description: `Transferencia de ${transferData.fromWalletName}`,
      date: transferData.date,
      type: 'income',
      walletId: transferData.toWalletId,
      categoryId: 'transfer-in',
    };

    setTransactions((prev) => [expenseTransaction, incomeTransaction, ...prev]);
  };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTransfer,
    isLoading,
    setTransactions,
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
