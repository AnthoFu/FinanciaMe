import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { Animated, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useCategories } from '../../../context/CategoriesContext';
import { Category, ColorTheme, Transaction, Wallet } from '../../../types';
import { IconSymbol } from '../../ui/IconSymbol';
import { getStyles } from './styles';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VEF' | 'USDT') => {
  const symbols = { USD: '$ ', VEF: 'Bs. ', USDT: 'USDT ' };
  return symbols[currency] || '';
};

type Styles = ReturnType<typeof getStyles>;

// Componente memoizado para cada item de transacción
interface TransactionItemProps {
  item: Transaction;
  wallet: Wallet | undefined;
  category: Category | undefined;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  colors: ColorTheme;
  styles: Styles;
}

const TransactionItem = React.memo(function TransactionItem({
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

  const renderRightActions = useCallback(
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
      onPress: () => void,
      icon: string,
      color: string,
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [0, 0, 0, 1],
      });
      return (
        <TouchableOpacity onPress={onPress}>
          <Animated.View
            style={[
              styles.rightAction,
              {
                backgroundColor: color,
                transform: [{ translateX: trans }],
              },
            ]}
          >
            <IconSymbol name={icon} size={20} color="white" />
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [styles.rightAction],
  );

  return (
    <Swipeable
      renderRightActions={(progress, dragX) => (
        <View style={{ flexDirection: 'row' }}>
          {renderRightActions(progress, dragX, () => onEdit(item), 'pencil', colors.primary)}
          {renderRightActions(progress, dragX, () => onDelete(item), 'trash', colors.notification)}
        </View>
      )}
    >
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIcon, isIncome ? styles.incomeIconBackground : styles.expenseIconBackground]}>
          <IconSymbol name={iconName} size={20} color={isIncome ? '#28a745' : colors.notification} />
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
    </Swipeable>
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
      <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
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
