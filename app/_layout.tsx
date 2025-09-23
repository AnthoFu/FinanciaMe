import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { BudgetsProvider } from '../context/BudgetsContext';
import { CategoriesProvider } from '../context/CategoriesContext';
import { FixedExpensesProvider } from '../context/FixedExpensesContext';
import { SavingsGoalsProvider } from '../context/SavingsGoalsContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { WalletsProvider } from '../context/WalletsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isOnboardingCompleted, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded || onboardingLoading) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <CategoriesProvider>
      <FixedExpensesProvider>
        <TransactionsProvider>
          <WalletsProvider>
            <SavingsGoalsProvider>
              <BudgetsProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack>
                    <Stack.Screen name="tabs" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="categories"
                      options={{ presentation: 'modal', title: 'Gestionar Categorías' }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />

                  {/* Tutorial de bienvenida */}
                  <OnboardingTutorial
                    isVisible={!isOnboardingCompleted}
                    onComplete={completeOnboarding}
                    onSkip={completeOnboarding}
                  />
                </ThemeProvider>
              </BudgetsProvider>
            </SavingsGoalsProvider>
          </WalletsProvider>
        </TransactionsProvider>
      </FixedExpensesProvider>
    </CategoriesProvider>
  );
}
