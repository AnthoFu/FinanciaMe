import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Transaction, Wallet } from '../../../types';
import { useCategories } from '../../../context/CategoriesContext';
import { IconSymbol } from '../../ui/IconSymbol';
import { styles } from './styles';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VEF' | 'USDT') => {
  const symbols = { USD: '$', VEF: 'Bs.', USDT: 'USDT' };
  return symbols[currency] || '';
};

interface RecentTransactionsListProps {
  transactions: Transaction[];
  wallets: Wallet[];
}

export function RecentTransactionsList({ transactions, wallets }: RecentTransactionsListProps) {
  const { getCategoryById } = useCategories();

  return (
    <View>
      <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
      <FlatList
        data={transactions.slice(0, 10)}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const wallet = wallets.find((w) => w.id === item.walletId);
          const category = getCategoryById(item.categoryId);
          const isIncome = item.type === 'income';
          const iconName = category ? category.icon : 'questionmark.circle.fill';

          return (
            <View style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: isIncome ? '#E5F9F0' : '#FEECEE' }]}>
                <IconSymbol name={iconName} size={20} color={isIncome ? '#28a745' : '#dc3545'} />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={styles.transactionSubText}>
                  {wallet ? wallet.name : 'Billetera eliminada'} · {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={isIncome ? styles.incomeText : styles.expenseText}>
                {isIncome ? '+' : '-'} {wallet ? getCurrencySymbol(wallet.currency) : ''}
                {item.amount.toFixed(2)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos recientes.</Text>}
      />
    </View>
  );
}