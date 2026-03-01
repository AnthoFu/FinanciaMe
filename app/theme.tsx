import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme, AppTheme } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import { ColorTheme } from '@/types';
import { IconSymbol } from '@/components/ui/IconSymbol';

const themeOptions: { id: AppTheme; title: string }[] = [
  { id: 'light', title: 'Claro' },
  { id: 'dark', title: 'Oscuro' },
  { id: 'system', title: 'Predeterminado' },
];

export default function ThemeSettingsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { theme, setTheme } = useAppTheme();

  return (
    <View style={styles.container}>
      {themeOptions.map((option) => (
        <TouchableOpacity key={option.id} style={styles.itemContainer} onPress={() => setTheme(option.id)}>
          <Text style={styles.itemText}>{option.title}</Text>
          {theme === option.id && <IconSymbol name="checkmark" size={20} color={colors.primary} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
      justifyContent: 'space-between',
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
    },
  });
