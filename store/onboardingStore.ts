import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ONBOARDING_COMPLETED_KEY } from '../constants/StorageKeys';
import { createMigratingStorage } from './persist-migration';

interface OnboardingState {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isOnboardingCompleted: false,
      isLoading: true,

      setIsLoading: (loading) => set({ isLoading: loading }),

      completeOnboarding: () => set({ isOnboardingCompleted: true }),

      resetOnboarding: () => set({ isOnboardingCompleted: false }),
    }),
    {
      name: ONBOARDING_COMPLETED_KEY,
      storage: createMigratingStorage<OnboardingState>('isOnboardingCompleted'),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    },
  ),
);
