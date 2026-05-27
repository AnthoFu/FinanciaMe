import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Wallet, Transaction } from '../types';
import { WALLETS_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  addWallet: (walletData: Omit<Wallet, 'id'>) => string;
  updateWallet: (walletData: Wallet) => void;
  deleteWallet: (walletId: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
  updateBalancesForTransaction: (
    amount: number,
    type: 'income' | 'expense',
    walletId: string,
    originalTransaction?: Transaction,
    commission?: number,
  ) => { success: boolean; error?: string };
  updateBalancesForTransfer: (
    fromWalletId: string,
    toWalletId: string,
    fromAmount: number,
    toAmount: number,
  ) => { success: boolean; error?: string };
  revertTransactionBalance: (transaction: Transaction) => { success: boolean; error?: string };
  setWallets: (wallets: Wallet[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      setWallets: (wallets) => set({ wallets }),

      addWallet: (walletData) => {
        const id = uuidv4();
        const newWallet: Wallet = {
          id,
          ...walletData,
        };
        set((state) => ({ wallets: [...state.wallets, newWallet] }));
        return id;
      },

      updateWallet: (walletData) => {
        set((state) => ({
          wallets: state.wallets.map((w) => (w.id === walletData.id ? walletData : w)),
        }));
      },

      deleteWallet: (walletId) => {
        set((state) => ({
          wallets: state.wallets.filter((w) => w.id !== walletId),
        }));
      },

      getWalletById: (id) => {
        return get().wallets.find((w) => w.id === id);
      },

      updateBalancesForTransaction: (amount, type, walletId, originalTransaction, commission = 0) => {
        const wallets = get().wallets;
        const wallet = wallets.find((w) => w.id === walletId);

        if (!wallet) {
          return { success: false, error: 'Billetera no encontrada' };
        }

        let potentialBalance = wallet.balance;

        if (originalTransaction && wallet.id === originalTransaction.walletId) {
          const originalCommission = originalTransaction.commission || 0;
          potentialBalance =
            originalTransaction.type === 'income'
              ? potentialBalance - originalTransaction.amount
              : potentialBalance + (originalTransaction.amount + originalCommission);
        }

        potentialBalance = type === 'income' ? potentialBalance + amount : potentialBalance - (amount + commission);

        if (potentialBalance < 0) {
          return { success: false, error: 'Saldo Insuficiente' };
        }

        set((state) => ({
          wallets: state.wallets.map((w) => {
            let newBalance = w.balance;
            if (originalTransaction && w.id === originalTransaction.walletId) {
              const originalCommission = originalTransaction.commission || 0;
              newBalance =
                originalTransaction.type === 'income'
                  ? newBalance - originalTransaction.amount
                  : newBalance + (originalTransaction.amount + originalCommission);
            }
            if (w.id === walletId) {
              newBalance = type === 'income' ? newBalance + amount : newBalance - (amount + commission);
            }
            return { ...w, balance: newBalance };
          }),
        }));

        return { success: true };
      },

      updateBalancesForTransfer: (fromWalletId, toWalletId, fromAmount, toAmount) => {
        const wallets = get().wallets;
        const fromWallet = wallets.find((w) => w.id === fromWalletId);
        const toWallet = wallets.find((w) => w.id === toWalletId);

        if (!fromWallet || !toWallet) {
          return { success: false, error: 'Una o ambas billeteras no fueron encontradas' };
        }

        if (fromWallet.balance < fromAmount) {
          return { success: false, error: `Saldo Insuficiente en "${fromWallet.name}"` };
        }

        set((state) => ({
          wallets: state.wallets.map((wallet) => {
            if (wallet.id === fromWalletId) {
              return { ...wallet, balance: wallet.balance - fromAmount };
            }
            if (wallet.id === toWalletId) {
              return { ...wallet, balance: wallet.balance + toAmount };
            }
            return wallet;
          }),
        }));

        return { success: true };
      },

      revertTransactionBalance: (transaction) => {
        const wallets = get().wallets;
        const wallet = wallets.find((w) => w.id === transaction.walletId);

        if (!wallet) {
          return { success: false, error: 'Billetera no encontrada' };
        }

        const commission = transaction.commission || 0;
        const newBalance =
          transaction.type === 'income'
            ? wallet.balance - transaction.amount
            : wallet.balance + (transaction.amount + commission);

        if (newBalance < 0) {
          return { success: false, error: 'La reversión resultaría en saldo negativo' };
        }

        set((state) => ({
          wallets: state.wallets.map((w) => {
            if (w.id === transaction.walletId) {
              return { ...w, balance: newBalance };
            }
            return w;
          }),
        }));

        return { success: true };
      },
    }),
    {
      name: WALLETS_KEY,
      storage: createMigratingStorage<WalletState>('wallets'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
