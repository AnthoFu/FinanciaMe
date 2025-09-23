import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Modal, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getThemedStyles } from '../../styles/themedStyles';
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
  const styles = getThemedStyles(colors);
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

  const showTimePicker = () => {
    // En una implementación real, usarías un DatePicker
    // Por ahora, mostramos opciones predefinidas
    Alert.alert('Seleccionar Hora', 'Elige la hora para los recordatorios:', [
      { text: '08:00', onPress: () => handleTimeChange('08:00') },
      { text: '09:00', onPress: () => handleTimeChange('09:00') },
      { text: '10:00', onPress: () => handleTimeChange('10:00') },
      { text: '12:00', onPress: () => handleTimeChange('12:00') },
      { text: '18:00', onPress: () => handleTimeChange('18:00') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Configuración de Notificaciones</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Habilitar notificaciones */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificaciones</Text>
              <Text style={styles.settingDescription}>Recibe recordatorios de gastos fijos</Text>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={(enabled) => setLocalSettings((prev) => ({ ...prev, enabled }))}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={localSettings.enabled ? '#FFFFFF' : colors.text}
            />
          </View>

          {/* Días de anticipación */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Recordar con anticipación</Text>
              <Text style={styles.settingDescription}>Días antes del vencimiento</Text>
            </View>
            <View style={styles.optionsContainer}>
              {[1, 2, 3, 7].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.optionButton, localSettings.reminderDays === days && styles.optionButtonSelected]}
                  onPress={() => handleReminderDaysChange(days)}
                >
                  <Text style={[styles.optionText, localSettings.reminderDays === days && styles.optionTextSelected]}>
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hora del recordatorio */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Hora del recordatorio</Text>
              <Text style={styles.settingDescription}>Cuándo recibir las notificaciones</Text>
            </View>
            <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
              <Text style={styles.timeText}>{localSettings.reminderTime}</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <IconSymbol name="info.circle" size={20} color={colors.tint} />
            <Text style={styles.infoText}>
              Las notificaciones te ayudarán a no olvidar tus gastos fijos y mantener un mejor control de tus finanzas.
            </Text>
          </View>
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingRow: {
    marginBottom: 24,
  },
  settingInfo: {
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  timeText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
