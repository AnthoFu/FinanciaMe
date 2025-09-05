import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Wallet } from '../../../types';
import { IconSymbol } from '../../ui/IconSymbol';
import { styles } from './styles';

// Helper to get currency symbol
const getCurrencySymbol = (currency: 'USD' | 'VEF' | 'USDT') => {
  const symbols = { USD: '$', VEF: 'Bs.', USDT: 'USDT' };
  return symbols[currency] || '';
};

interface WalletsCarouselProps {
  wallets: Wallet[];
  onOpenModal: (type: 'income' | 'expense', walletId: string) => void;
}

export function WalletsCarousel({ wallets, onOpenModal }: WalletsCarouselProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Billeteras</Text>
      <FlatList
        horizontal
        data={wallets}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.walletsCarousel}
        renderItem={({ item }) => (
          <View style={styles.walletCard}>
            <View style={styles.walletCardHeader}>
              <Text style={styles.walletCardName}>{item.name}</Text>
              <Text style={styles.walletCardCurrency}>{item.currency}</Text>
            </View>
            <Text style={styles.walletCardBalance}>
              {getCurrencySymbol(item.currency)} {item.balance.toFixed(2)}
            </Text>
            <View style={styles.walletCardActions}>
              <TouchableOpacity
                style={[styles.walletButton, styles.expenseButton]}
                onPress={() => onOpenModal('expense', item.id)}
              >
                <IconSymbol name="arrow.down" size={16} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.walletButton, styles.incomeButton]}
                onPress={() => onOpenModal('income', item.id)}
              >
                <IconSymbol name="arrow.up" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No has creado ninguna billetera.</Text>}
      />
    </View>
  );
}
