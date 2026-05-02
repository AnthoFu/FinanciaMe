import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRIVACY_SETTINGS_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface PrivacyState {
  isBalancesHidden: boolean;
  toggleBalancesHidden: () => void;
  setBalancesHidden: (hidden: boolean) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      isBalancesHidden: false,
      toggleBalancesHidden: () => set((state) => ({ isBalancesHidden: !state.isBalancesHidden })),
      setBalancesHidden: (hidden) => set({ isBalancesHidden: hidden }),
    }),
    {
      name: PRIVACY_SETTINGS_KEY,
      storage: createMigratingStorage<PrivacyState>('privacy'),
    },
  ),
);
