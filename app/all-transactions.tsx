import { TransactionItem, getStyles as getTransactionItemStyles } from '@/components/home/RecentTransactionsList';
import TransactionModal from '@/components/TransactionModal';
import Toast from '@/components/Toast';
import { useCategories } from '@/context/CategoriesContext';
import { useTransactions } from '@/context/TransactionsContext';
import { useWallets } from '@/context/WalletsContext';
import { useTheme } from '@/hooks/useTheme';
import { getThemedStyles } from '@/styles/themedStyles';
import { ColorTheme, Transaction } from '@/types';
import { Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Alert } from 'react-native';

export default function AllTransactionsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);
  const transactionItemStyles = getTransactionItemStyles(colors);

  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { wallets } = useWallets();
  const { getCategoryById } = useCategories();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = useCallback((message: string) => {
    setToast({ isVisible: true, message });
  }, []);

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (transaction: Transaction) => {
      Alert.alert('Eliminar Movimiento', '¿Estás seguro de que quieres eliminar este movimiento?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            showToast('Movimiento eliminado con éxito');
          },
        },
      ]);
    },
    [deleteTransaction, showToast],
  );

  const handleSubmit = useCallback(
    (transactionData: Omit<Transaction, 'id'>) => {
      if (editingTransaction) {
        updateTransaction({ ...editingTransaction, ...transactionData });
        showToast('Movimiento actualizado con éxito');
      }
      // No se crean nuevos desde aquí, solo se editan.
    },
    [editingTransaction, updateTransaction, showToast],
  );

  const sections = useMemo(() => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const grouped = sortedTransactions.reduce<Record<string, Transaction[]>>((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [transactions]);

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'Todos los Movimientos' }} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const wallet = wallets.find((w) => w.id === item.walletId);
          const category = getCategoryById(item.categoryId);
          return (
            <TransactionItem
              item={item}
              wallet={wallet}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
              colors={colors}
              styles={transactionItemStyles}
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>
            {new Date(title).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC', // Asegura que la fecha no cambie por la zona horaria
            })}
          </Text>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos para mostrar.</Text>}
        stickySectionHeadersEnabled={false}
      />

      {editingTransaction && (
        <TransactionModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
          initialData={editingTransaction}
        />
      )}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onHide={() => setToast({ isVisible: false, message: '' })}
      />
    </View>
  );
}

const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    list: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 16,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      backgroundColor: colors.background,
      paddingVertical: 8,
      paddingTop: 24,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      color: colors.text,
      opacity: 0.6,
    },
  });
