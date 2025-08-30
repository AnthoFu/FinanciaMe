import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { styles } from './metrics.styles';

type TimeRange = '7_days' | '30_days' | 'all_time';

export default function MetricsScreen() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [spendingByCategory, setSpendingByCategory] = useState<Record<string, number>>({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30_days');

  const filterAndAggregateTransactions = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    if (selectedTimeRange === '7_days') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedTimeRange === '30_days') {
      startDate.setDate(now.getDate() - 30);
    } else { // 'all_time'
      startDate = new Date(0); // Epoch
    }

    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && transactionDate >= startDate;
    });

    const categorySpending: Record<string, number> = {};
    let total = 0;

    filtered.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)?.name || 'Sin Categoría';
      categorySpending[category] = (categorySpending[category] || 0) + t.amount;
      total += t.amount;
    });

    setSpendingByCategory(categorySpending);
    setTotalSpending(total);
  }, [transactions, categories, selectedTimeRange]);

  useEffect(() => {
    if (!transactionsLoading && !categoriesLoading) {
      filterAndAggregateTransactions();
    }
  }, [transactions, selectedTimeRange, transactionsLoading, categoriesLoading, filterAndAggregateTransactions]);

  if (transactionsLoading || categoriesLoading) {
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
          <Text style={selectedTimeRange === '7_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}>Últimos 7 Días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === '30_days' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('30_days')}
        >
          <Text style={selectedTimeRange === '30_days' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}>Últimos 30 Días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, selectedTimeRange === 'all_time' && styles.timeRangeButtonSelected]}
          onPress={() => setSelectedTimeRange('all_time')}
        >
          <Text style={selectedTimeRange === 'all_time' ? styles.timeRangeButtonTextSelected : styles.timeRangeButtonText}>Todo el Tiempo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Gasto Total</Text>
          <Text style={styles.summaryAmount}>Bs. {totalSpending.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Gasto por Categoría</Text>
        {Object.keys(spendingByCategory).length > 0 ? (
          Object.entries(spendingByCategory)
            .sort(([, amountA], [, amountB]) => amountB - amountA) // Sort by amount descending
            .map(([category, amount]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryAmount}>Bs. {amount.toFixed(2)}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>No hay gastos registrados para este período.</Text>
        )}
      </ScrollView>
    </View>
  );
}