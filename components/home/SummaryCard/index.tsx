import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, Text } from 'react-native';
import { getStyles } from './styles';
import { IconSymbol } from '../../ui/IconSymbol';

interface SummaryCardProps {
  balances: {
    consolidatedBcv: number;
    consolidatedAverage: number;
    byCurrency: { VEF: number; USD: number; USDT: number };
  };
  bcvRate: number;
  usdtRate: number;
  averageRate: number;
  lastUpdated: number | null;
}

export function SummaryCard({ balances, bcvRate, usdtRate, averageRate, lastUpdated }: SummaryCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

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

  return (
    <View style={styles.summaryCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <Text style={styles.summaryCardTitle}>SALDO TOTAL (REF. BCV)</Text>
        {lastUpdated && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconSymbol
              name={isOld ? 'exclamationmark.triangle.fill' : 'clock.fill'}
              size={12}
              color={isOld ? colors.notification : colors.text}
              style={{ opacity: 0.6 }}
            />
            <Text style={[styles.summaryRateText, { fontSize: 10, opacity: 0.6, marginBottom: 0 }]}>
              {formatLastUpdated(lastUpdated)}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.summaryCardBalance}>$ {balances.consolidatedBcv.toFixed(2)}</Text>
      <Text style={styles.summaryCardTitle}>SALDO TOTAL (REF. PROMEDIO)</Text>
      <Text style={styles.summaryCardBalance}>$ {balances.consolidatedAverage.toFixed(2)}</Text>
      <View style={styles.summaryRates}>
        <Text style={styles.summaryRateText}>BCV: Bs. {bcvRate.toFixed(2)}</Text>
        <Text style={styles.summaryRateText}>USDT: Bs. {usdtRate.toFixed(2)}</Text>
        <Text style={styles.summaryRateText}>PROMEDIO: Bs. {averageRate.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryCurrencies}>
        <Text style={styles.summaryCurrencyItem}>VEF: {balances.byCurrency.VEF.toFixed(2)}</Text>
        <Text style={styles.summaryCurrencyItem}>USD: {balances.byCurrency.USD.toFixed(2)}</Text>
        <Text style={styles.summaryCurrencyItem}>USDT: {balances.byCurrency.USDT.toFixed(2)}</Text>
      </View>
    </View>
  );
}
