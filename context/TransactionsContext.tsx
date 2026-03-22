import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { TransactionsContextType } from '../types';
import { useTransactionStore } from '../store/transactionStore';

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const store = useTransactionStore();

  const value = useMemo(
    () => ({
      transactions: store.transactions,
      isLoading: store.isLoading,
      addTransaction: store.addTransaction,
      updateTransaction: store.updateTransaction,
      deleteTransaction: store.deleteTransaction,
      addTransfer: store.addTransfer,
      setTransactions: store.setTransactions,
    }),
    [store],
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
