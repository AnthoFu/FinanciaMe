import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, Transaction, WalletsContextType } from '../types';
import { WALLETS_KEY } from '../constants/StorageKeys';
import { v4 as uuidv4 } from 'uuid';

// Create the context
const WalletsContext = createContext<WalletsContextType | undefined>(undefined);

// Create the provider component
export function WalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const walletsRef = useRef<Wallet[]>([]);

  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const storedWallets = await AsyncStorage.getItem(WALLETS_KEY);
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets);
        const sanitizedWallets = parsedWallets.map((wallet: Wallet) => ({
          ...wallet,
          balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
        }));
        setWallets(sanitizedWallets);
      }
    } catch (e) {
      console.error('[loadWallets] Error al cargar las billeteras:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveWallets = async () => {
        try {
          await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
        } catch (e) {
          console.error('[saveWallets] Error al guardar las billeteras:', e);
        }
      };
      saveWallets();
    }
  }, [wallets, isLoading]);

  const addWallet = useCallback((walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      id: uuidv4(),
      ...walletData,
    };
    setWallets((prev) => [...prev, newWallet]);
  }, []);

  const updateWallet = useCallback((walletData: Wallet) => {
    setWallets((prev) => prev.map((w) => (w.id === walletData.id ? walletData : w)));
  }, []);

  const deleteWallet = useCallback((walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
  }, []);

  const getWalletById = useCallback(
    (id: string) => {
      return wallets.find((w) => w.id === id);
    },
    [wallets],
  );

  const updateBalancesForTransaction = useCallback(
    (
      amount: number,
      type: 'income' | 'expense',
      walletId: string,
      originalTransaction?: Transaction,
    ): { success: boolean; error?: string } => {
      const currentWallets = walletsRef.current;
      const wallet = currentWallets.find((w) => w.id === walletId);

      if (!wallet) {
        return { success: false, error: 'Billetera no encontrada' };
      }

      let potentialBalance = wallet.balance;

      if (originalTransaction && wallet.id === originalTransaction.walletId) {
        potentialBalance =
          originalTransaction.type === 'income'
            ? potentialBalance - originalTransaction.amount
            : potentialBalance + originalTransaction.amount;
      }

      potentialBalance = type === 'income' ? potentialBalance + amount : potentialBalance - amount;

      if (potentialBalance < 0) {
        return { success: false, error: 'Saldo Insuficiente' };
      }

      setWallets((prevWallets) => {
        return prevWallets.map((w) => {
          let newBalance = w.balance;
          if (originalTransaction && w.id === originalTransaction.walletId) {
            newBalance =
              originalTransaction.type === 'income'
                ? newBalance - originalTransaction.amount
                : newBalance + originalTransaction.amount;
          }
          if (w.id === walletId) {
            newBalance = type === 'income' ? newBalance + amount : newBalance - amount;
          }
          return { ...w, balance: newBalance };
        });
      });

      return { success: true };
    },
    [],
  );

  const updateBalancesForTransfer = useCallback(
    (
      fromWalletId: string,
      toWalletId: string,
      fromAmount: number,
      toAmount: number,
    ): { success: boolean; error?: string } => {
      const currentWallets = walletsRef.current;
      const fromWallet = currentWallets.find((w) => w.id === fromWalletId);
      const toWallet = currentWallets.find((w) => w.id === toWalletId);

      if (!fromWallet || !toWallet) {
        return { success: false, error: 'Una o ambas billeteras no fueron encontradas' };
      }

      if (fromWallet.balance < fromAmount) {
        return { success: false, error: `Saldo Insuficiente en "${fromWallet.name}"` };
      }

      setWallets((prevWallets) => {
        return prevWallets.map((wallet) => {
          if (wallet.id === fromWalletId) {
            return { ...wallet, balance: wallet.balance - fromAmount };
          }
          if (wallet.id === toWalletId) {
            return { ...wallet, balance: wallet.balance + toAmount };
          }
          return wallet;
        });
      });

      return { success: true };
    },
    [],
  );

  const revertTransactionBalance = useCallback((transaction: Transaction): { success: boolean; error?: string } => {
    const currentWallets = walletsRef.current;
    const wallet = currentWallets.find((w) => w.id === transaction.walletId);

    if (!wallet) {
      return { success: false, error: 'Billetera no encontrada' };
    }

    const newBalance =
      transaction.type === 'income' ? wallet.balance - transaction.amount : wallet.balance + transaction.amount;

    if (newBalance < 0) {
      return { success: false, error: 'La reversión resultaría en saldo negativo' };
    }

    setWallets((prevWallets) => {
      return prevWallets.map((w) => {
        if (w.id === transaction.walletId) {
          return { ...w, balance: newBalance };
        }
        return w;
      });
    });

    return { success: true };
  }, []);

  const value = useMemo(
    () => ({
      wallets,
      isLoading,
      addWallet,
      updateWallet,
      deleteWallet,
      getWalletById,
      updateBalancesForTransaction,
      updateBalancesForTransfer,
      revertTransactionBalance,
      setWallets,
    }),
    [
      wallets,
      isLoading,
      addWallet,
      updateWallet,
      deleteWallet,
      getWalletById,
      updateBalancesForTransaction,
      updateBalancesForTransfer,
      revertTransactionBalance,
    ],
  );

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>;
}

export function useWallets() {
  const context = useContext(WalletsContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletsProvider');
  }
  return context;
}
