import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
import { useTransactions } from '../../context/TransactionsContext';
import { Transaction } from '../../types';

type TimeRange = '7_days' | '30_days' | 'all_time';

export default function MetricsScreen() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<Record<string, number>>({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30_days');

  useEffect(() => {
    if (!transactionsLoading && !categoriesLoading) {
      filterAndAggregateTransactions();
    }
  }, [transactions, selectedTimeRange, transactionsLoading, categoriesLoading]);

  const filterAndAggregateTransactions = () => {
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

    setFilteredTransactions(filtered);

    const categorySpending: Record<string, number> = {};
    let total = 0;

    filtered.forEach(t => {
      const category = t.category || 'Sin Categoría';
      categorySpending[category] = (categorySpending[category] || 0) + t.amount;
      total += t.amount;
    });

    setSpendingByCategory(categorySpending);
    setTotalSpending(total);
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f0f4f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1D3D47',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  timeRangeButtonSelected: {
    backgroundColor: '#007bff',
  },
  timeRangeButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  timeRangeButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});