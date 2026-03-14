import { useTheme } from '@/hooks/useTheme';
import { Link } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
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
      <Text style={isIncome ? styles.incomeText : styles.expenseText}>
        {isIncome ? '+' : '-'} {wallet ? getCurrencySymbol(wallet.currency) : ''}
        {item.amount.toFixed(2)}
      </Text>
      <View style={styles.menuButton}>
        <Menu>
          <MenuTrigger>
            <IconSymbol name="ellipsis.vertical" size={20} color={colors.text} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                backgroundColor: colors.card,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              },
            }}
          >
            <MenuOption onSelect={() => onEdit(item)}>
              <Text style={{ color: colors.text, fontSize: 16, padding: 8 }}>Editar</Text>
            </MenuOption>
            <MenuOption onSelect={() => onDelete(item)}>
              <Text style={{ color: colors.notification, fontSize: 16, padding: 8 }}>Borrar</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
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
    return transactions.slice(0, 10);
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
