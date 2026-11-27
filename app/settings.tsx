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
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  applyBackup,
  exportBackupToFile,
  FinanciaMeBackup,
  getLocalRecordCount,
  pickAndParseBackupFile,
} from '@/services/backupService';

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
  const [pendingBackup, setPendingBackup] = useState<{
    backup: FinanciaMeBackup;
    backupRecordCount: number;
    localRecordCount: number;
  } | null>(null);

  const handleNotificationSettingsSave = async (settings: typeof notificationSettings) => {
    try {
      await saveNotificationSettings(settings);
      showToast({ message: 'Configuración de recordatorios guardada', type: 'success' });
    } catch {
      showToast({ message: 'Error al guardar la configuración', type: 'error' });
    }
  };

  const handleExportBackup = async () => {
    try {
      const { recordCount } = await exportBackupToFile();
      showToast({
        message: `Respaldo generado (${recordCount} registros)`,
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al exportar el respaldo';
      showToast({ message, type: 'error' });
    }
  };

  const handleImportBackup = async () => {
    try {
      const result = await pickAndParseBackupFile();
      if (result.canceled) return;

      setPendingBackup({
        backup: result.backup,
        backupRecordCount: result.backupRecordCount,
        localRecordCount: getLocalRecordCount(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al leer el archivo de respaldo';
      showToast({ message, type: 'error' });
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingBackup) return;

    try {
      await applyBackup(pendingBackup.backup);
      showToast({
        message: `Respaldo importado (${pendingBackup.backupRecordCount} registros)`,
        type: 'success',
      });
    } catch {
      showToast({ message: 'Error al restaurar el respaldo', type: 'error' });
    } finally {
      setPendingBackup(null);
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
      id: 'export-backup',
      title: 'Exportar respaldo (JSON)',
      icon: 'square.and.arrow.up',
      action: handleExportBackup,
    },
    {
      id: 'import-backup',
      title: 'Importar respaldo (JSON)',
      icon: 'square.and.arrow.down',
      action: handleImportBackup,
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
      <ConfirmationModal
        isVisible={pendingBackup !== null}
        onClose={() => setPendingBackup(null)}
        onConfirm={handleConfirmImport}
        title="¿Importar respaldo?"
        message={
          pendingBackup
            ? pendingBackup.localRecordCount > 0
              ? `Importar esto eliminará los ${pendingBackup.localRecordCount} registros que tienes registrados localmente y los reemplazará con ${pendingBackup.backupRecordCount} registros del respaldo. ¿Estás seguro?`
              : `Se importarán ${pendingBackup.backupRecordCount} registros desde el archivo de respaldo. ¿Estás seguro?`
            : ''
        }
        confirmText="Importar"
        cancelText="Cancelar"
        type="destructive"
        icon="exclamationmark.triangle.fill"
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
