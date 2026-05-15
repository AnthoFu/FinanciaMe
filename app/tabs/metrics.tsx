import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useCategories } from '../../context/CategoriesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useWallets } from '../../context/WalletsContext';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { getStyles } from '../../styles/metrics.styles';
import { getThemedStyles } from '../../styles/themedStyles';

type TimeRange = '7_days' | '30_days' | 'all_time';

const { width } = Dimensions.get('window');

const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#8AC926',
  '#1982C4',
  '#6A4C93',
  '#FF595E',
];

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
  const [dailySpending, setDailySpending] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netFlow, setNetFlow] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30_days');

  const getAmountInUSD = useCallback(
    (amount: number, currency: 'VES' | 'USD' | 'USDT' | 'EUR') => {
      if (!bcvRate) return 0;

      switch (currency) {
        case 'VES':
          return amount / bcvRate;
        case 'USDT':
          return usdtRate > 0 ? (amount * usdtRate) / bcvRate : amount; // Fallback if usdtRate is not available
        case 'EUR':
          return amount * 1.08; // Rough estimate if EUR rate not in context, or use proper eurRate if available
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
      startDate = new Date(0);
    }

    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate;
    });

    const categorySpending: Record<string, number> = {};
    const dailyData: Record<string, number> = {};
    let spending = 0;
    let income = 0;

    // Initialize daily data for the last N days
    if (selectedTimeRange !== 'all_time') {
      const days = selectedTimeRange === '7_days' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = 0;
      }
    }

    filtered.forEach((t) => {
      const wallet = wallets.find((w) => w.id === t.walletId);
      if (!wallet) return;

      const amountInUSD = getAmountInUSD(t.amount, wallet.currency);
      const dateStr = t.date.split('T')[0];

      if (t.type === 'expense') {
        const categoryName = categories.find((c) => c.id === t.categoryId)?.name || 'Sin Categoría';
        categorySpending[categoryName] = (categorySpending[categoryName] || 0) + amountInUSD;
        spending += amountInUSD;

        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += amountInUSD;
        } else if (selectedTimeRange === 'all_time') {
          // For all time, maybe group by month? For now just keep it simple
          const monthStr = dateStr.substring(0, 7);
          dailyData[monthStr] = (dailyData[monthStr] || 0) + amountInUSD;
        }
      } else if (t.type === 'income') {
        income += amountInUSD;
      }
    });

    setSpendingByCategory(categorySpending);
    setTotalSpending(spending);
    setTotalIncome(income);
    setNetFlow(income - spending);

    // Prepare line chart data
    const labels = Object.keys(dailyData).map((label) => {
      if (selectedTimeRange === '7_days') return label.split('-')[2];
      if (selectedTimeRange === '30_days') return label.split('-')[2];
      return label.split('-')[1]; // Month for all_time
    });

    // Thin out labels for 30 days
    const thinnedLabels = labels.map((l, i) => {
      if (selectedTimeRange === '30_days') return i % 5 === 0 ? l : '';
      return l;
    });

    setDailySpending({
      labels: thinnedLabels,
      datasets: [{ data: Object.values(dailyData) }],
    });
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

  const pieData = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5
    .map(([name, amount], index) => ({
      name,
      population: amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Métricas Financieras' }} />

      <View style={styles.header}>
        <Text style={globalStyles.title}>Métricas</Text>
        <View style={styles.timeRangeContainer}>
          {(['7_days', '30_days', 'all_time'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, selectedTimeRange === range && styles.timeRangeButtonSelected]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text
                style={selectedTimeRange === range ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}
              >
                {range === '7_days' ? '7D' : range === '30_days' ? '30D' : 'Total'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || ratesRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.summaryGrid}>
          <View style={styles.miniCard}>
            <Text style={styles.miniCardTitle}>Ingresos</Text>
            <Text style={[styles.miniCardAmount, { color: colors.primary }]}>$ {totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniCardTitle}>Gastos</Text>
            <Text style={[styles.miniCardAmount, { color: colors.notification }]}>$ {totalSpending.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.summaryTitle}>Flujo Neto</Text>
          <Text style={netFlow >= 0 ? styles.netFlowAmountPositive : styles.netFlowAmountNegative}>
            $ {netFlow.toFixed(2)}
          </Text>
          <Text style={[styles.summaryTitle, { fontSize: 12, marginTop: 4 }]}>
            {netFlow >= 0 ? '¡Buen trabajo! Estás ahorrando.' : 'Cuidado, estás gastando más de lo que ganas.'}
          </Text>
        </View>

        {totalSpending > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tendencia de Gasto</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={dailySpending}
                width={width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) =>
                    `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    colors.text +
                    Math.round(opacity * 255)
                      .toString(16)
                      .padStart(2, '0'),
                  style: { borderRadius: 16 },
                  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            </View>

            <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={pieData}
                width={width - 40}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Gasto por Categoría</Text>
        {Object.keys(spendingByCategory).length > 0 ? (
          Object.entries(spendingByCategory)
            .sort(([, amountA], [, amountB]) => amountB - amountA)
            .map(([category, amount]) => (
              <View key={category} style={styles.categoryItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      {
                        backgroundColor:
                          CHART_COLORS[Object.keys(spendingByCategory).indexOf(category) % CHART_COLORS.length],
                      },
                    ]}
                  />
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <Text style={styles.categoryAmount}>$ {amount.toFixed(2)}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>No hay gastos registrados para este período.</Text>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
