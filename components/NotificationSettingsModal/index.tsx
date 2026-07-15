import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';

interface NotificationSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  settings: {
    enabled: boolean;
    reminderDays: number;
    reminderTime: string;
  };
  onSave: (settings: { enabled: boolean; reminderDays: number; reminderTime: string }) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isVisible,
  onClose,
  settings,
  onSave,
}) => {
  const { colors } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReminderDaysChange = (days: number) => {
    setLocalSettings((prev) => ({ ...prev, reminderDays: days }));
  };

  const handleTimeChange = (time: string) => {
    setLocalSettings((prev) => ({ ...prev, reminderTime: time }));
  };

  const times = ['08:00', '09:00', '10:00', '12:00', '15:00', '18:00', '20:00'];

  // Los estilos se definen aquí para poder usar `colors` del tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    settingRow: {
      marginBottom: 32,
    },
    settingRowInline: {
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingInfo: {
      flex: 1,
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
    },
    optionsContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minWidth: 60,
      alignItems: 'center',
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    optionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.primary,
      marginLeft: 12,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    saveButtonText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Configuración</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Habilitar notificaciones */}
          <View style={styles.settingRowInline}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificaciones</Text>
              <Text style={styles.settingDescription}>Recibe recordatorios de gastos fijos</Text>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={(enabled) => setLocalSettings((prev) => ({ ...prev, enabled }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={localSettings.enabled ? '#FFFFFF' : colors.text}
            />
          </View>

          {/* Días de anticipación */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Recordar con anticipación</Text>
              <Text style={styles.settingDescription}>Días antes del vencimiento (0 = el mismo día)</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.optionsContainer}>
                {[0, 1, 2, 3, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[styles.optionButton, localSettings.reminderDays === days && styles.optionButtonSelected]}
                    onPress={() => handleReminderDaysChange(days)}
                  >
                    <Text style={[styles.optionText, localSettings.reminderDays === days && styles.optionTextSelected]}>
                      {days === 0 ? 'Hoy' : `${days} d`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Hora del recordatorio */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Hora del recordatorio</Text>
              <Text style={styles.settingDescription}>Cuándo recibir las notificaciones</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.optionsContainer}>
                {times.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.optionButton, localSettings.reminderTime === time && styles.optionButtonSelected]}
                    onPress={() => handleTimeChange(time)}
                  >
                    <Text style={[styles.optionText, localSettings.reminderTime === time && styles.optionTextSelected]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Las notificaciones te ayudarán a no olvidar tus gastos fijos y mantener un mejor control de tus finanzas.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
