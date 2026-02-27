import { useTheme } from '@/hooks/useTheme';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { ColorTheme, Wallet } from '../../../types';
import { IconSymbol } from '../../ui/IconSymbol';
import { getStyles } from './styles';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VES' | 'USDT') => {
  const symbols = { USD: '$ ', VES: 'Bs. ', USDT: 'USDT ' };
  return symbols[currency] || '';
};

type Styles = ReturnType<typeof getStyles>;

// Componente memoizado para cada item de billetera
interface WalletItemProps {
  item: Wallet;
  onOpenModal: (type: 'income' | 'expense', walletId: string) => void;
  colors: ColorTheme;
  styles: Styles;
}

const WalletItem = React.memo(function WalletItem({ item, onOpenModal, colors, styles }: WalletItemProps) {
  const handleExpensePress = useCallback(() => {
    onOpenModal('expense', item.id);
  }, [onOpenModal, item.id]);

  const handleIncomePress = useCallback(() => {
    onOpenModal('income', item.id);
  }, [onOpenModal, item.id]);

  return (
    <View style={styles.walletCard}>
      <View style={styles.walletCardHeader}>
        <Text style={styles.walletCardName}>{item.name}</Text>
        <Text style={styles.walletCardCurrency}>{item.currency}</Text>
      </View>
      <Text style={styles.walletCardBalance}>
        {getCurrencySymbol(item.currency)}
        {item.balance.toFixed(2)}
      </Text>
      <View style={styles.walletCardActions}>
        <TouchableOpacity style={[styles.walletButton, styles.expenseButton]} onPress={handleExpensePress}>
          <IconSymbol name="arrow.down" size={16} color={colors.card} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.walletButton, styles.incomeButton]} onPress={handleIncomePress}>
          <IconSymbol name="arrow.up" size={16} color={colors.card} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

interface WalletsCarouselProps {
  wallets: Wallet[];
  onOpenModal: (type: 'income' | 'expense', walletId: string) => void;
}

export function WalletsCarousel({ wallets, onOpenModal }: WalletsCarouselProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Memoizar el keyExtractor
  const keyExtractor = useCallback((item: Wallet) => item.id, []);

  // Memoizar el renderItem
  const renderItem = useCallback(
    ({ item }: { item: Wallet }) => (
      <WalletItem item={item} onOpenModal={onOpenModal} colors={colors} styles={styles} />
    ),
    [onOpenModal, colors, styles],
  );

  // Memoizar el componente de lista vacía
  const ListEmptyComponent = useMemo(
    () => <Text style={styles.emptyText}>No has creado ninguna billetera.</Text>,
    [styles.emptyText],
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Billeteras</Text>
      <FlatList
        horizontal
        data={wallets}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        style={styles.walletsCarousel}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        // Optimizaciones para FlatList horizontal
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
}
