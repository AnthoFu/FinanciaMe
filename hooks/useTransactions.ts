import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import { TRANSACTIONS_KEY } from '../constants/StorageKeys';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  return { transactions, setTransactions, addTransaction, isLoading };
}
