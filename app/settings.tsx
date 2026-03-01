import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ColorTheme } from '@/types';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

const menuItems = [
  {
    id: 'categories',
    title: 'Gestión de categorías',
    icon: 'tag.fill',
    route: '/categories',
  },
  {
    id: 'theme',
    title: 'Apariencia',
    icon: 'paintbrush.fill',
    route: '/theme',
  },
  // Add other settings items here in the future
] as const;

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const renderItem = ({ item }: { item: (typeof menuItems)[0] }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(item.route)}>
      <IconSymbol name={item.icon as any} size={24} color={colors.primary} />
      <Text style={styles.itemText}>{item.title}</Text>
      <IconSymbol name="chevron.right" size={18} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
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
      gap: 15,
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
  });
