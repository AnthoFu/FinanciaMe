import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Colors } from '@/constants/Colors';
import { BudgetsProvider } from '../context/BudgetsContext';
import { CategoriesProvider } from '../context/CategoriesContext';
import { FixedExpensesProvider } from '../context/FixedExpensesContext';
import { SavingsGoalsProvider } from '../context/SavingsGoalsContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { WalletsProvider } from '../context/WalletsContext';

// Create custom themes
const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...Colors.light,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...Colors.dark,
  },
};

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CategoriesProvider>
        <FixedExpensesProvider>
          <TransactionsProvider>
            <WalletsProvider>
              <SavingsGoalsProvider>
                <BudgetsProvider>
                  <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
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
    </GestureHandlerRootView>
  );
}
