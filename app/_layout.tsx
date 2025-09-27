import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from '@react-navigation/native';
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

function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="categories"
        options={{
          presentation: 'modal',
          title: 'Gestionar Categorías',
          animation: 'fade',
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isOnboardingCompleted, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded || onboardingLoading) {
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
                  <ThemedStack />
                  <StatusBar style="auto" />
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
