import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from '../types';
import { WALLETS_KEY } from '../constants/StorageKeys';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWallets = async () => {
      setIsLoading(true);
      try {
        const storedWallets = await AsyncStorage.getItem(WALLETS_KEY);
        if (storedWallets) {
          setWallets(JSON.parse(storedWallets));
        }
      } catch (e) {
        console.error("Failed to load wallets.", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadWallets();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveWallets = async () => {
        try {
          await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
        } catch (e) {
          console.error("Failed to save wallets.", e);
        }
      };
      saveWallets();
    }
  }, [wallets, isLoading]);

  const addWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      id: Date.now().toString(),
      ...walletData,
    };
    setWallets(prev => [...prev, newWallet]);
  };

  const updateWalletName = (walletId: string, name: string) => {
    setWallets(prev =>
      prev.map(w => (w.id === walletId ? { ...w, name } : w))
    );
  };

  const deleteWallet = (walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
  };

  return { wallets, setWallets, addWallet, updateWalletName, deleteWallet, isLoading };
}
