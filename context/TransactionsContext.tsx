import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import { TRANSACTIONS_KEY } from '../constants/StorageKeys';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transactionData: Omit<Transaction, 'id'>) => void;
  isLoading: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

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
      console.error("Failed to load transactions.", e);
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
          console.error("Failed to save transactions.", e);
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
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const value = {
    transactions,
    addTransaction,
    isLoading,
    setTransactions,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
