import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { PieChart } from 'react-native-chart-kit';
import { useCategories } from '../../context/CategoriesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { getStyles } from '../../styles/metrics.styles';
import { getThemedStyles } from '../../styles/themedStyles';

type TimeRange = '7_days' | '30_days' | 'all_time';

// // Function to generate a random color
// const getRandomColor = () => {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };

export default function MetricsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);

  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { wallets, isLoading: walletsLoading } = useWallets();
  const { bcvRate, usdtRate, loading: ratesLoading, refreshRates, isRefreshing: ratesRefreshing } = useExchangeRates();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [spendingByCategory, setSpendingByCategory] = useState<Record<string, number>>({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netFlow, setNetFlow] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30_days');

  // const chartData = Object.entries(spendingByCategory).map(([name, population]) => ({
  //   name,
  //   population,
  //   color: getRandomColor(),
  //   legendFontColor: colors.text,
  //   legendFontSize: 15,
  // }));

  const getAmountInUSD = useCallback(
    (amount: number, currency: 'VES' | 'USD' | 'USDT') => {
      if (!bcvRate || !usdtRate) return 0;

      switch (currency) {
        case 'VES':
          return amount / bcvRate;
        case 'USDT':
          return (amount * usdtRate) / bcvRate;
        case 'USD':
          return amount;
        default:
          return 0;
      }
    },
    [bcvRate, usdtRate],
  );

  const filterAndAggregateTransactions = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    if (selectedTimeRange === '7_days') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedTimeRange === '30_days') {
      startDate.setDate(now.getDate() - 30);
    } else {
      // 'all_time'
      startDate = new Date(0); // Epoch
    }

    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate;
    });

    const categorySpending: Record<string, number> = {};
    let spending = 0;
    let income = 0;

    filtered.forEach((t) => {
      const wallet = wallets.find((w) => w.id === t.walletId);
      if (!wallet) return;

      const amountInUSD = getAmountInUSD(t.amount, wallet.currency);

      if (t.type === 'expense') {
        const categoryName = categories.find((c) => c.id === t.categoryId)?.name || 'Sin Categoría';
        categorySpending[categoryName] = (categorySpending[categoryName] || 0) + amountInUSD;
        spending += amountInUSD;
      } else if (t.type === 'income') {
        income += amountInUSD;
      }
    });

    setSpendingByCategory(categorySpending);
    setTotalSpending(spending);
    setTotalIncome(income);
    setNetFlow(income - spending);
  }, [transactions, categories, wallets, selectedTimeRange, getAmountInUSD]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const allLoaded = !transactionsLoading && !categoriesLoading && !walletsLoading && (!ratesLoading || bcvRate !== 0);
    if (allLoaded) {
      filterAndAggregateTransactions();
    }
  }, [
    transactions,
    selectedTimeRange,
    transactionsLoading,
    categoriesLoading,
    walletsLoading,
    ratesLoading,
    bcvRate,
    filterAndAggregateTransactions,
  ]);

  const isLoading = transactionsLoading || categoriesLoading || walletsLoading || (ratesLoading && bcvRate === 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Cargando métricas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Métricas Financieras' }} />
      <Text style={globalStyles.title}>Métricas Financieras</Text>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === '7_days' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('7_days')}
        >
          <Text
            style={selectedTimeRange === '7_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            7 Días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === '30_days' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('30_days')}
        >
          <Text
            style={selectedTimeRange === '30_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            30 Días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === 'all_time' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('all_time')}
        >
          <Text
            style={selectedTimeRange === 'all_time' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            Total
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || ratesRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ingreso Total</Text>
          <Text style={styles.incomeAmount}>$ {totalIncome.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Gasto Total</Text>
          <Text style={styles.summaryAmount}>$ {totalSpending.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Flujo Neto</Text>
          <Text style={netFlow >= 0 ? styles.netFlowAmountPositive : styles.netFlowAmountNegative}>
            $ {netFlow.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Gasto por Categoría</Text>
        {/* {Object.keys(spendingByCategory).length > 0 ? ( ... ) : ( ... )} */}
        {Object.keys(spendingByCategory).length > 0 ? (
          Object.entries(spendingByCategory)
            .sort(([, amountA], [, amountB]) => amountB - amountA) // Sort by amount descending
            .map(([category, amount]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryAmount}>$ {amount.toFixed(2)}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>No hay gastos registrados para este período.</Text>
        )}
      </ScrollView>
    </View>
  );
}
