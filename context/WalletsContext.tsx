import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from '../types';
import { WALLETS_KEY } from '../constants/StorageKeys';

// Define the shape of the context value
interface WalletsContextType {
  wallets: Wallet[];
  addWallet: (walletData: Omit<Wallet, 'id'>) => void;
  updateWallet: (walletData: Wallet) => void;
  deleteWallet: (walletId: string) => void;
  isLoading: boolean;
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
}

// Create the context
const WalletsContext = createContext<WalletsContextType | undefined>(undefined);

// Create the provider component
export function WalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const storedWallets = await AsyncStorage.getItem(WALLETS_KEY);
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets);
        // Ensure balance is always a number
        const sanitizedWallets = parsedWallets.map((wallet: any) => ({
          ...wallet,
          balance: parseFloat(wallet.balance) || 0,
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
    loadWallets(); // Initial load
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

  const addWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      id: Date.now().toString(),
      ...walletData, // contains name, balance, and currency
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const updateWallet = (walletData: Wallet) => {
    setWallets((prev) => prev.map((w) => (w.id === walletData.id ? walletData : w)));
  };

  const deleteWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
  };

  const value = {
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    isLoading,
    setWallets,
  };

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>;
}

// Create a custom hook to use the context
export function useWallets() {
  const context = useContext(WalletsContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletsProvider');
  }
  return context;
}
