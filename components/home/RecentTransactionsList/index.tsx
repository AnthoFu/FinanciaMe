import { useTheme } from '@/hooks/useTheme';
import { Link } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useCategories } from '../../../context/CategoriesContext';
import { Category, ColorTheme, Transaction, Wallet } from '../../../types';
import { IconSymbol } from '../../ui/IconSymbol';
import { getStyles } from './styles';
export { getStyles } from './styles';

// Helper to get currency symbol
export const getCurrencySymbol = (currency: 'USD' | 'VES' | 'USDT') => {
  const symbols = { USD: '$ ', VES: 'Bs. ', USDT: 'USDT ' };
  return symbols[currency] || '';
};

export type Styles = ReturnType<typeof getStyles>;

// Componente memoizado para cada item de transacción
export interface TransactionItemProps {
  item: Transaction;
  wallet: Wallet | undefined;
  category: Category | undefined;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  colors: ColorTheme;
  styles: Styles;
}

export const TransactionItem = React.memo(function TransactionItem({
  item,
  wallet,
  category,
  onEdit,
  onDelete,
  colors,
  styles,
}: TransactionItemProps) {
  const isIncome = item.type === 'income';
  const iconName = category ? category.icon : 'questionmark.circle.fill';

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, isIncome ? styles.incomeIconBackground : styles.expenseIconBackground]}>
        <IconSymbol name={iconName as any} size={20} color={isIncome ? '#28a745' : colors.notification} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.transactionSubText}>
          {wallet ? wallet.name : 'Billetera eliminada'} · {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconButton}>
            <IconSymbol name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.iconButton}>
            <IconSymbol name="trash" size={16} color={colors.notification} />
          </TouchableOpacity>
        </View>
        <Text style={isIncome ? styles.incomeText : styles.expenseText}>
          {isIncome ? '+' : '-'} {wallet ? getCurrencySymbol(wallet.currency) : ''}
          {(item.amount + (item.commission || 0)).toFixed(2)}
        </Text>
        {item.commission ? (
          <Text style={[styles.transactionSubText, { fontSize: 10, textAlign: 'right' }]}>
            Com: {getCurrencySymbol(wallet?.currency as any)}
            {item.commission.toFixed(2)}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

interface RecentTransactionsListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function RecentTransactionsList({ transactions, wallets, onEdit, onDelete }: RecentTransactionsListProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { getCategoryById } = useCategories();

  // Memoizar las transacciones recientes para evitar recalcular en cada render
  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [transactions]);

  // Memoizar el keyExtractor para evitar recrear la función
  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  // Memoizar el renderItem para mejor performance
  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => {
      const wallet = wallets.find((w) => w.id === item.walletId);
      const category = getCategoryById(item.categoryId);

      return (
        <TransactionItem
          item={item}
          wallet={wallet}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          colors={colors}
          styles={styles}
        />
      );
    },
    [wallets, getCategoryById, onEdit, onDelete, colors, styles],
  );

  // Memoizar el componente de lista vacía
  const ListEmptyComponent = useMemo(
    () => <Text style={styles.emptyText}>No hay movimientos recientes.</Text>,
    [styles.emptyText],
  );

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
        <Link href="/all-transactions" asChild>
          <TouchableOpacity>
            <Text style={styles.seeAllButtonText}>Ver todo</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <FlatList
        data={recentTransactions}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        // Optimizaciones adicionales para FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
      />
    </View>
  );
}
