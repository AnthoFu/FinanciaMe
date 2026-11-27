import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { NOTIFICATION_SETTINGS_KEY } from '@/constants/StorageKeys';
import { useBudgetStore } from '@/store/budgetStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useFixedExpenseStore } from '@/store/fixedExpenseStore';
import { usePrivacyStore } from '@/store/privacyStore';
import { useSavingsGoalStore } from '@/store/savingsGoalStore';
import { AppTheme, useThemeStore } from '@/store/themeStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useWalletStore } from '@/store/walletStore';
import { Budget, Category, FixedExpense, SavingsGoal, Transaction, Wallet } from '@/types';

export const BACKUP_SCHEMA_VERSION = 1;

export interface NotificationSettingsBackup {
  enabled: boolean;
  reminderDays: number;
  reminderTime: string;
}

export interface FinanciaMeBackup {
  version: number;
  app: 'FinanciaMe';
  exportedAt: string;
  data: {
    wallets: Wallet[];
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    fixedExpenses: FixedExpense[];
    savingsGoals: SavingsGoal[];
  };
  settings?: {
    theme?: AppTheme;
    isBalancesHidden?: boolean;
    notificationSettings?: NotificationSettingsBackup;
  };
}

const REQUIRED_DATA_ARRAYS = [
  'wallets',
  'transactions',
  'categories',
  'budgets',
  'fixedExpenses',
  'savingsGoals',
] as const;

const isRecordArrayWithIds = (value: unknown): value is { id: string }[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'object' && item !== null && typeof (item as { id?: unknown }).id === 'string');

export const countBackupRecords = (data: FinanciaMeBackup['data']): number =>
  data.wallets.length +
  data.transactions.length +
  data.budgets.length +
  data.fixedExpenses.length +
  data.savingsGoals.length;

export const getLocalRecordCount = (): number =>
  useWalletStore.getState().wallets.length +
  useTransactionStore.getState().transactions.length +
  useBudgetStore.getState().budgets.length +
  useFixedExpenseStore.getState().expenses.length +
  useSavingsGoalStore.getState().savingsGoals.length;

export const buildBackupPayload = async (): Promise<FinanciaMeBackup> => {
  let notificationSettings: NotificationSettingsBackup | undefined;
  try {
    const rawNotificationSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (rawNotificationSettings) {
      notificationSettings = JSON.parse(rawNotificationSettings) as NotificationSettingsBackup;
    }
  } catch {
    notificationSettings = undefined;
  }

  return {
    version: BACKUP_SCHEMA_VERSION,
    app: 'FinanciaMe',
    exportedAt: new Date().toISOString(),
    data: {
      wallets: useWalletStore.getState().wallets,
      transactions: useTransactionStore.getState().transactions,
      categories: useCategoryStore.getState().categories,
      budgets: useBudgetStore.getState().budgets,
      fixedExpenses: useFixedExpenseStore.getState().expenses,
      savingsGoals: useSavingsGoalStore.getState().savingsGoals,
    },
    settings: {
      theme: useThemeStore.getState().theme,
      isBalancesHidden: usePrivacyStore.getState().isBalancesHidden,
      ...(notificationSettings ? { notificationSettings } : {}),
    },
  };
};

export const exportBackupToFile = async (): Promise<{ fileName: string; recordCount: number }> => {
  const payload = await buildBackupPayload();
  const jsonContent = JSON.stringify(payload, null, 2);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `financiame-respaldo-${dateStamp}.json`;
  const recordCount = countBackupRecords(payload.data);

  if (Platform.OS === 'web') {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { fileName, recordCount };
  }

  const file = new File(Paths.cache, fileName);
  file.write(jsonContent);

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (!isSharingAvailable) {
    throw new Error('La función de compartir archivos no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar respaldo de FinanciaMe',
    UTI: 'public.json',
  });

  return { fileName, recordCount };
};

export const parseAndValidateBackup = (rawText: string): FinanciaMeBackup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('El archivo seleccionado no es un JSON válido.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('El formato del archivo de respaldo es inválido.');
  }

  const candidate = parsed as Partial<FinanciaMeBackup>;
  if (candidate.app !== 'FinanciaMe' || typeof candidate.version !== 'number') {
    throw new Error('Este archivo no corresponde a un respaldo de FinanciaMe.');
  }

  if (!candidate.data || typeof candidate.data !== 'object') {
    throw new Error('El respaldo no contiene datos válidos.');
  }

  for (const key of REQUIRED_DATA_ARRAYS) {
    if (!isRecordArrayWithIds((candidate.data as Record<string, unknown>)[key])) {
      throw new Error(`El respaldo tiene un formato inválido en "${key}".`);
    }
  }

  return candidate as FinanciaMeBackup;
};

export type PickBackupResult =
  | { canceled: true }
  | { canceled: false; backup: FinanciaMeBackup; backupRecordCount: number };

export const pickAndParseBackupFile = async (): Promise<PickBackupResult> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  let rawText: string;

  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    rawText = await response.text();
  } else {
    const file = new File(asset.uri);
    rawText = await file.text();
  }

  const backup = parseAndValidateBackup(rawText);
  return {
    canceled: false,
    backup,
    backupRecordCount: countBackupRecords(backup.data),
  };
};

const ensureEssentialCategories = (categories: Category[]): Category[] => {
  const result = [...categories];

  if (!result.some((c) => c.id === 'transfer-in')) {
    result.push({
      id: 'transfer-in',
      name: 'Transferencia Entrante',
      icon: 'arrow.down.left.circle.fill',
      type: 'income',
    });
  }

  if (!result.some((c) => c.id === 'transfer-out')) {
    result.push({
      id: 'transfer-out',
      name: 'Transferencia Saliente',
      icon: 'arrow.up.right.circle.fill',
      type: 'expense',
    });
  }

  return result;
};

export const applyBackup = async (backup: FinanciaMeBackup): Promise<void> => {
  const { data, settings } = backup;

  useWalletStore.getState().setWallets(data.wallets);
  useTransactionStore.getState().setTransactions(data.transactions);
  useCategoryStore.getState().setCategories(ensureEssentialCategories(data.categories));
  useBudgetStore.getState().setBudgets(data.budgets);
  useFixedExpenseStore.getState().setExpenses(data.fixedExpenses);
  useSavingsGoalStore.getState().setSavingsGoals(data.savingsGoals);

  if (settings?.theme) {
    useThemeStore.getState().setTheme(settings.theme);
  }
  if (typeof settings?.isBalancesHidden === 'boolean') {
    usePrivacyStore.getState().setBalancesHidden(settings.isBalancesHidden);
  }
  if (settings?.notificationSettings) {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings.notificationSettings));
  }
};
