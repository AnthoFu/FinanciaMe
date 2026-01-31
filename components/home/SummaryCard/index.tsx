import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, Text } from 'react-native';
import { getStyles } from './styles';

interface SummaryCardProps {
  balances: {
    consolidatedBcv: number;
    consolidatedAverage: number;
    byCurrency: { VEF: number; USD: number; USDT: number };
  };
  bcvRate: number;
  usdtRate: number;
  averageRate: number;
}

export function SummaryCard({ balances, bcvRate, usdtRate, averageRate }: SummaryCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardTitle}>SALDO TOTAL (REF. BCV)</Text>
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
