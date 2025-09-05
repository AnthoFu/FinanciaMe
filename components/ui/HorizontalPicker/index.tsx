import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface HorizontalPickerProps<T> {
  label: string;
  data: T[];
  selectedValue: string | null;
  keyExtractor: (item: T) => string;
  onSelect: (value: string) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
}

export function HorizontalPicker<T>({
  label,
  data,
  selectedValue,
  keyExtractor,
  onSelect,
  renderItem,
}: HorizontalPickerProps<T>) {
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
