import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { styles } from './metrics.styles';

type TimeRange = '7_days' | '30_days' | 'all_time';

export default function MetricsScreen() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { wallets, isLoading: walletsLoading } = useWallets();
  const { bcvRate, usdtRate, loading: ratesLoading } = useExchangeRates();

  const [spendingByCategory, setSpendingByCategory] = useState<Record<string, number>>({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30_days');

  const getAmountInUSD = useCallback(
    (amount: number, currency: 'VEF' | 'USD' | 'USDT') => {
      if (!bcvRate || !usdtRate) return 0;

      switch (currency) {
        case 'VEF':
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
      return t.type === 'expense' && transactionDate >= startDate;
    });

    const categorySpending: Record<string, number> = {};
    let total = 0;

    filtered.forEach((t) => {
      const wallet = wallets.find((w) => w.id === t.walletId);
      if (!wallet) return;

      const amountInUSD = getAmountInUSD(t.amount, wallet.currency);
      const categoryName = categories.find((c) => c.id === t.categoryId)?.name || 'Sin Categoría';

      categorySpending[categoryName] = (categorySpending[categoryName] || 0) + amountInUSD;
      total += amountInUSD;
    });

    setSpendingByCategory(categorySpending);
    setTotalSpending(total);
  }, [transactions, categories, wallets, selectedTimeRange, getAmountInUSD]);

  useEffect(() => {
    const allLoaded = !transactionsLoading && !categoriesLoading && !walletsLoading && !ratesLoading;
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
    filterAndAggregateTransactions,
  ]);

  const isLoading = transactionsLoading || categoriesLoading || walletsLoading || ratesLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando métricas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Métricas de Gastos' }} />
      <Text style={styles.title}>Métricas de Gastos</Text>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === '7_days' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('7_days')}
        >
          <Text
            style={selectedTimeRange === '7_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            Últimos 7 Días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === '30_days' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('30_days')}
        >
          <Text
            style={selectedTimeRange === '30_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            Últimos 30 Días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === 'all_time' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('all_time')}
        >
          <Text
            style={selectedTimeRange === 'all_time' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
          >
            Todo el Tiempo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Gasto Total</Text>
          <Text style={styles.summaryAmount}>$ {totalSpending.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Gasto por Categoría</Text>
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
