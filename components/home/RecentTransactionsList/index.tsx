import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Transaction, Wallet } from '../../../types';
import { useCategories } from '../../../context/CategoriesContext';
import { IconSymbol } from '../../ui/IconSymbol';
import { getStyles } from './styles';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VEF' | 'USDT') => {
  const symbols = { USD: '$ ', VEF: 'Bs. ', USDT: 'USDT ' };
  return symbols[currency] || '';
};

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

  const renderRightActions = (
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
  };

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
            <Swipeable
              renderRightActions={(progress, dragX) => (
                <View style={{ flexDirection: 'row' }}>
                  {renderRightActions(progress, dragX, () => onEdit(item), 'pencil', colors.primary)}
                  {renderRightActions(progress, dragX, () => onDelete(item), 'trash', colors.notification)}
                </View>
              )}
            >
              <View style={styles.transactionItem}>
                <View
                  style={[
                    styles.transactionIcon,
                    isIncome ? styles.incomeIconBackground : styles.expenseIconBackground,
                  ]}
                >
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
              </View>
            </Swipeable>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos recientes.</Text>}
      />
    </View>
  );
}
