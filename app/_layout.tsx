import { MenuProvider } from 'react-native-popup-menu';
import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import { Colors } from '@/constants/Colors';
import { BudgetsProvider } from '../context/BudgetsContext';
import { CategoriesProvider } from '../context/CategoriesContext';
import { ExchangeRatesProvider } from '../context/ExchangeRatesContext';
import { FixedExpensesProvider } from '../context/FixedExpensesContext';
import { SavingsGoalsProvider } from '../context/SavingsGoalsContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { WalletsProvider } from '../context/WalletsContext';
import { AppThemeProvider, useAppTheme } from '../context/ThemeContext';

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
        name="settings"
        options={{
          title: 'Configuración',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: 'Gestionar Categorías',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: 'Apariencia',
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

function RootLayoutNav() {
  const { colorScheme } = useAppTheme();
  const { isOnboardingCompleted, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  // Si el onboarding aún carga, asumimos falso por un momento para evitar pantalla negra
  const showOnboarding = !onboardingLoading && !isOnboardingCompleted;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <ThemedStack />
      <StatusBar style="auto" />
      <OnboardingTutorial isVisible={showOnboarding} onComplete={completeOnboarding} onSkip={completeOnboarding} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <AppThemeProvider>
          <OnboardingProvider>
            <ExchangeRatesProvider>
              <CategoriesProvider>
                <FixedExpensesProvider>
                  <TransactionsProvider>
                    <WalletsProvider>
                      <SavingsGoalsProvider>
                        <BudgetsProvider>
                          <RootLayoutNav />
                        </BudgetsProvider>
                      </SavingsGoalsProvider>
                    </WalletsProvider>
                  </TransactionsProvider>
                </FixedExpensesProvider>
              </CategoriesProvider>
            </ExchangeRatesProvider>
          </OnboardingProvider>
        </AppThemeProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
