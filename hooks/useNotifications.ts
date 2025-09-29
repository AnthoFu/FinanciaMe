import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NOTIFICATION_SETTINGS_KEY } from '../constants/StorageKeys';
import { FixedExpense } from '../types';

// Configurar el comportamiento de las notificaciones solo si está disponible
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log('Notifications not available in Expo Go:', error);
}

interface NotificationSettings {
  enabled: boolean;
  reminderDays: number; // Días antes del vencimiento para recordar
  reminderTime: string; // Hora del día para enviar recordatorios (formato HH:MM)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderDays: 1,
  reminderTime: '09:00',
};

export const useNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
    requestPermissions();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settings) {
        setNotificationSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.log('Notifications not available in Expo Go:', error);
    }
  };

  const scheduleFixedExpenseReminder = async (expense: FixedExpense) => {
    if (!notificationSettings.enabled) return;

    try {
      // Calcular la fecha de recordatorio
      const today = new Date();
      const reminderDate = new Date(today);
      reminderDate.setDate(today.getDate() + notificationSettings.reminderDays);

      // Configurar la hora del recordatorio
      const [hours, minutes] = notificationSettings.reminderTime.split(':').map(Number);
      reminderDate.setHours(hours, minutes, 0, 0);

      // Si la fecha de recordatorio ya pasó, programar para el próximo mes
      if (reminderDate <= today) {
        reminderDate.setMonth(reminderDate.getMonth() + 1);
      }

      const notificationId = `fixed_expense_${expense.id}`;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: '💳 Recordatorio de Gasto Fijo',
          body: `No olvides pagar "${expense.name}" - ${expense.amount} ${expense.currency}`,
          data: {
            type: 'fixed_expense_reminder',
            expenseId: expense.id,
            expenseName: expense.name,
            amount: expense.amount,
            currency: expense.currency,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      console.log(`Notificación programada para ${expense.name} el ${reminderDate.toLocaleDateString()}`);
    } catch (error) {
      console.log('Notifications not available in Expo Go:', error);
    }
  };

  const cancelFixedExpenseReminder = async (expenseId: string) => {
    try {
      const notificationId = `fixed_expense_${expenseId}`;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Notifications not available in Expo Go:', error);
    }
  };

  const scheduleAllFixedExpenseReminders = async (expenses: FixedExpense[]) => {
    if (!notificationSettings.enabled) return;

    try {
      // Cancelar todas las notificaciones existentes de gastos fijos
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const fixedExpenseNotifications = scheduledNotifications.filter((notification) =>
        notification.identifier?.startsWith('fixed_expense_'),
      );

      for (const notification of fixedExpenseNotifications) {
        if (notification.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }

      // Programar nuevas notificaciones
      for (const expense of expenses) {
        await scheduleFixedExpenseReminder(expense);
      }
    } catch (error) {
      console.log('Notifications not available in Expo Go:', error);
    }
  };

  const sendImmediateNotification = async (title: string, body: string, data?: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Inmediato
      });
    } catch (error) {
      console.log('Notifications not available in Expo Go:', error);
    }
  };

  return {
    notificationSettings,
    isLoading,
    saveNotificationSettings,
    scheduleFixedExpenseReminder,
    cancelFixedExpenseReminder,
    scheduleAllFixedExpenseReminders,
    sendImmediateNotification,
  };
};
