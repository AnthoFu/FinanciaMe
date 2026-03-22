import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { WalletsContextType } from '../types';
import { useWalletStore } from '../store/walletStore';

// Create the context
const WalletsContext = createContext<WalletsContextType | undefined>(undefined);

// Create the provider component
export function WalletsProvider({ children }: { children: ReactNode }) {
  const store = useWalletStore();

  const value = useMemo(
    () => ({
      wallets: store.wallets,
      isLoading: store.isLoading,
      addWallet: store.addWallet,
      updateWallet: store.updateWallet,
      deleteWallet: store.deleteWallet,
      getWalletById: store.getWalletById,
      updateBalancesForTransaction: store.updateBalancesForTransaction,
      updateBalancesForTransfer: store.updateBalancesForTransfer,
      revertTransactionBalance: store.revertTransactionBalance,
      setWallets: store.setWallets,
    }),
    [store],
  );

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
