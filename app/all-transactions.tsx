import { TransactionItem, getStyles as getTransactionItemStyles } from '@/components/home/RecentTransactionsList';
import TransactionModal from '@/components/TransactionModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useCategories } from '@/context/CategoriesContext';
import { useTransactions } from '@/context/TransactionsContext';
import { useWallets } from '@/context/WalletsContext';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { getThemedStyles } from '@/styles/themedStyles';
import { ColorTheme, Transaction } from '@/types';
import { Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AllTransactionsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);
  const transactionItemStyles = getTransactionItemStyles(colors);

  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { wallets } = useWallets();
  const { categories, getCategoryById } = useCategories();
  const { showToast } = useToast();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      showToast({ message: 'Movimiento eliminado con éxito', type: 'success' });
      setTransactionToDelete(null);
    }
  }, [deleteTransaction, showToast, transactionToDelete]);

  const handleSubmit = useCallback(
    (transactionData: Omit<Transaction, 'id'>, date?: string) => {
      if (editingTransaction) {
        updateTransaction({ ...editingTransaction, ...transactionData, date: date || editingTransaction.date });
        showToast({ message: 'Movimiento actualizado con éxito', type: 'success' });
        setModalVisible(false);
      }
    },
    [editingTransaction, updateTransaction, showToast],
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategoryId]);

  const sections = useMemo(() => {
    const sortedTransactions = [...filteredTransactions].sort(
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
  }, [filteredTransactions]);

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'Todos los Movimientos' }} />

      <View style={styles.headerFilters}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.text} style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesFilter}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategoryId === 'all' && styles.categoryChipSelected]}
            onPress={() => setSelectedCategoryId('all')}
          >
            <Text style={[styles.categoryChipText, selectedCategoryId === 'all' && styles.categoryChipTextSelected]}>
              Todos
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategoryId === cat.id && styles.categoryChipSelected]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <IconSymbol
                name={cat.icon as any}
                size={16}
                color={selectedCategoryId === cat.id ? 'white' : colors.text}
                style={styles.categoryChipIcon}
              />
              <Text style={[styles.categoryChipText, selectedCategoryId === cat.id && styles.categoryChipTextSelected]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
              timeZone: 'UTC',
            })}
          </Text>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos que coincidan con la búsqueda.</Text>}
        stickySectionHeadersEnabled={false}
      />

      {editingTransaction && (
        <TransactionModal
          isVisible={isModalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSubmit}
          type={editingTransaction.type}
          wallets={wallets}
          transactionToEdit={editingTransaction}
        />
      )}

      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setTransactionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Movimiento"
        message="¿Estás seguro de que quieres eliminar este movimiento?"
        confirmText="Eliminar"
        type="destructive"
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
    headerFilters: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
      opacity: 0.6,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    clearIcon: {
      marginLeft: 8,
      opacity: 0.4,
    },
    categoriesFilter: {
      paddingVertical: 4,
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    categoryChipText: {
      color: colors.text,
      fontSize: 14,
    },
    categoryChipTextSelected: {
      color: 'white',
      fontWeight: 'bold',
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
