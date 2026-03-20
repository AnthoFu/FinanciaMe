import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NOTIFICATION_SETTINGS_KEY } from '../constants/StorageKeys';
import { FixedExpense } from '../types';

// Detectar si estamos en Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configurar el comportamiento de las notificaciones solo si NO estamos en Expo Go
if (!isExpoGo) {
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
    console.log('Notifications handler setup failed:', error);
  }
}

interface NotificationSettings {
  enabled: boolean;
  reminderDays: number;
  reminderTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderDays: 1,
  reminderTime: '09:00',
};

export const useNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const requestPermissions = useCallback(async () => {
    if (isExpoGo) return; // No intentar en Expo Go

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
      console.log('Error requesting permissions:', error);
    }
  }, []);

  const loadNotificationSettings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadNotificationSettings();
    requestPermissions();
  }, [loadNotificationSettings, requestPermissions]);

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const scheduleFixedExpenseReminder = async (expense: FixedExpense) => {
    if (isExpoGo || !notificationSettings.enabled) return;

    try {
      const today = new Date();
      const reminderDate = new Date(today);
      reminderDate.setDate(today.getDate() + notificationSettings.reminderDays);

      const [hours, minutes] = notificationSettings.reminderTime.split(':').map(Number);
      reminderDate.setHours(hours, minutes, 0, 0);

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
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        } as any,
      });
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  };

  const cancelFixedExpenseReminder = async (expenseId: string) => {
    if (isExpoGo) return;
    try {
      const notificationId = `fixed_expense_${expenseId}`;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  };

  const scheduleAllFixedExpenseReminders = useCallback(
    async (expenses: FixedExpense[]) => {
      if (isExpoGo || !notificationSettings.enabled) return;

      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const fixedExpenseNotifications = scheduledNotifications.filter((notification) =>
          notification.identifier?.startsWith('fixed_expense_'),
        );

        for (const notification of fixedExpenseNotifications) {
          if (notification.identifier) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }

        for (const expense of expenses) {
          await scheduleFixedExpenseReminder(expense);
        }
      } catch (error) {
        console.log('Error scheduling all notifications:', error);
      }
    },
    [notificationSettings.enabled],
  );

  const sendImmediateNotification = async (title: string, body: string, data?: Record<string, unknown>) => {
    if (isExpoGo) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: null,
      });
    } catch (error) {
      console.log('Error sending immediate notification:', error);
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
