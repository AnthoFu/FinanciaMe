import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ONBOARDING_COMPLETED_KEY } from '../constants/StorageKeys';

export const useOnboarding = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setIsOnboardingCompleted(completed === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setIsOnboardingCompleted(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    isOnboardingCompleted,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
};
