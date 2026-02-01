import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { getStyles } from './styles';

interface HorizontalPickerProps<T, K extends string> {
  label: string;
  data: T[];
  selectedValue: K | null;
  keyExtractor: (item: T) => K;
  onSelect: (value: K) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
}

export function HorizontalPicker<T, K extends string>({
  label,
  data,
  selectedValue,
  keyExtractor,
  onSelect,
  renderItem,
}: HorizontalPickerProps<T, K>) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={{ width: '100%' }}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {data.map((item) => {
          const key = keyExtractor(item);
          const isSelected = selectedValue === key;
          return (
            <TouchableOpacity key={key} onPress={() => onSelect(key)}>
              {renderItem(item, isSelected)}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
