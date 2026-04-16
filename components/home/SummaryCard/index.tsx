import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { View, Text, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Dimensions } from 'react-native';
import { getStyles } from './styles';
import { IconSymbol } from '../../ui/IconSymbol';

interface SummaryCardProps {
  balances: {
    consolidatedBcv: number;
    consolidatedAverage: number;
    byCurrency: { VES: number; USD: number; USDT: number };
  };
  bcvRate: number;
  usdtRate: number;
  eurRate: number;
  averageRate: number;
  lastUpdated: number | null;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

export function SummaryCard({
  balances,
  bcvRate = 0,
  usdtRate = 0,
  eurRate = 0,
  averageRate = 0,
  lastUpdated,
}: SummaryCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeFormat = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) return '0.00';
    return value.toFixed(2);
  };

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) {
      return `Hoy ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    return `${dateStr} ${timeStr}`;
  };

  const isOld = lastUpdated ? Date.now() - lastUpdated > 24 * 60 * 60 * 1000 : false;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.paginationDot, activeIndex === i && styles.paginationDotActive]} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
      >
        {/* Card 1: Global Summary */}
        <View style={[styles.summaryCard, styles.cardGlobal]}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}
          >
            <Text style={styles.summaryCardTitle}>SALDO TOTAL (REF. BCV)</Text>
            {lastUpdated && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol
                  name={isOld ? 'exclamationmark.triangle.fill' : 'clock.fill'}
                  size={12}
                  color="white"
                  style={{ opacity: 0.6 }}
                />
                <Text style={[styles.summaryRateText, { fontSize: 10, opacity: 0.6 }]}>
                  {formatLastUpdated(lastUpdated)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.summaryCardBalance}>$ {safeFormat(balances.consolidatedBcv)}</Text>
          <Text style={styles.summaryCardTitle}>SALDO TOTAL (REF. PROMEDIO)</Text>
          <Text style={[styles.summaryCardBalance, { fontSize: 24, marginVertical: 4 }]}>
            $ {safeFormat(balances.consolidatedAverage)}
          </Text>

          <View style={styles.summaryRates}>
            <Text style={styles.summaryRateText}>BCV: {safeFormat(bcvRate)}</Text>
            <Text style={styles.summaryRateText}>PROM: {safeFormat(averageRate)}</Text>
          </View>
        </View>

        {/* Card 2: VES Summary */}
        <View style={[styles.summaryCard, styles.cardVES]}>
          <Text style={styles.summaryCardTitle}>TOTAL BOLÍVARES (VES)</Text>
          <View style={styles.currencyCardContent}>
            <Text style={styles.summaryCardBalance}>Bs. {safeFormat(balances.byCurrency.VES)}</Text>
            <Text style={[styles.summaryCardTitle, { opacity: 0.8 }]}>
              ≈ $ {safeFormat(averageRate > 0 ? balances.byCurrency.VES / averageRate : 0)}
            </Text>
          </View>
          <View style={styles.summaryRates}>
            <Text style={styles.summaryRateText}>EUR BCV: {safeFormat(eurRate)}</Text>
          </View>
        </View>

        {/* Card 3: USD Summary */}
        <View style={[styles.summaryCard, styles.cardUSD]}>
          <Text style={styles.summaryCardTitle}>TOTAL DÓLARES (USD)</Text>
          <View style={styles.currencyCardContent}>
            <Text style={styles.summaryCardBalance}>$ {safeFormat(balances.byCurrency.USD)}</Text>
          </View>
          <View style={styles.summaryRates}>
            <Text style={styles.summaryRateText}>PROM: {safeFormat(averageRate)}</Text>
          </View>
        </View>

        {/* Card 4: USDT Summary */}
        <View style={[styles.summaryCard, styles.cardUSDT]}>
          <Text style={styles.summaryCardTitle}>TOTAL CRIPTO (USDT)</Text>
          <View style={styles.currencyCardContent}>
            <Text style={styles.summaryCardBalance}>{safeFormat(balances.byCurrency.USDT)} USDT</Text>
            <Text style={[styles.summaryCardTitle, { opacity: 0.8 }]}>
              ≈ $ {safeFormat(averageRate > 0 ? (balances.byCurrency.USDT * usdtRate) / averageRate : 0)}
            </Text>
          </View>
          <View style={styles.summaryRates}>
            <Text style={styles.summaryRateText}>USDT: {safeFormat(usdtRate)}</Text>
          </View>
        </View>
      </ScrollView>
      {renderPagination()}
    </View>
  );
}
