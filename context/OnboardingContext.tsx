import React, { createContext, useContext, useMemo } from 'react';
import { useOnboardingStore } from '../store/onboardingStore';

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useOnboardingStore();

  const value = useMemo(
    () => ({
      isOnboardingCompleted: store.isOnboardingCompleted,
      isLoading: store.isLoading,
      completeOnboarding: store.completeOnboarding,
      resetOnboarding: store.resetOnboarding,
    }),
    [store],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
