import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';
import { ColorTheme } from '@/types';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOnboarding } from '@/context/OnboardingContext';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  route?: any;
  action?: () => void;
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { notificationSettings, saveNotificationSettings } = useNotifications();
  const styles = getStyles(colors);
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const [isNotificationSettingsVisible, setNotificationSettingsVisible] = useState(false);

  const handleNotificationSettingsSave = async (settings: typeof notificationSettings) => {
    try {
      await saveNotificationSettings(settings);
      showToast({ message: 'Configuración de recordatorios guardada', type: 'success' });
    } catch {
      showToast({ message: 'Error al guardar la configuración', type: 'error' });
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'categories',
      title: 'Gestión de categorías',
      icon: 'tag.fill',
      route: '/categories',
    },
    {
      id: 'notifications',
      title: 'Recordatorios de gastos fijos',
      icon: 'bell.fill',
      action: () => setNotificationSettingsVisible(true),
    },
    {
      id: 'theme',
      title: 'Apariencia',
      icon: 'paintbrush.fill',
      route: '/theme',
    },
    {
      id: 'tutorial',
      title: 'Ver tutorial',
      icon: 'questionmark.circle.fill',
      action: resetOnboarding,
    },
  ];

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.route) {
          router.push(item.route);
        } else if (item.action) {
          item.action();
        }
      }}
    >
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
      <NotificationSettingsModal
        isVisible={isNotificationSettingsVisible}
        onClose={() => setNotificationSettingsVisible(false)}
        settings={notificationSettings}
        onSave={handleNotificationSettingsSave}
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
