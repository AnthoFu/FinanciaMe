import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../types';
import { TRANSACTIONS_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transactionData: Omit<Transaction, 'id'>) => void;
  updateTransaction: (updatedTransaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addTransfer: (transferData: {
    fromWalletId: string;
    toWalletId: string;
    fromAmount: number;
    toAmount: number;
    fromWalletName: string;
    toWalletName: string;
    date: string;
    commission?: number;
  }) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          id: uuidv4(),
          ...transactionData,
        };
        set((state) => ({ transactions: [newTransaction, ...state.transactions] }));
      },

      updateTransaction: (updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      addTransfer: (transferData) => {
        const transferId = uuidv4();
        const commission = transferData.commission || 0;
        const expenseTransaction: Transaction = {
          id: `t_${transferId}_exp`,
          amount: transferData.fromAmount,
          description: `Transferencia a ${transferData.toWalletName}${commission > 0 ? ' (Incluye comisión)' : ''}`,
          date: transferData.date,
          type: 'expense',
          walletId: transferData.fromWalletId,
          categoryId: 'transfer-out',
          commission: commission,
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

        set((state) => ({
          transactions: [expenseTransaction, incomeTransaction, ...state.transactions],
        }));
      },
    }),
    {
      name: TRANSACTIONS_KEY,
      storage: createMigratingStorage<TransactionState>('transactions'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
