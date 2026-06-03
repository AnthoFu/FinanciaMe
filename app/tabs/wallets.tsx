import { useTheme } from '@/hooks/useTheme';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from '../../components/Toast';
import { IconSymbol } from '../../components/ui/IconSymbol';
import WalletModal from '../../components/WalletModal';
import { useWallets } from '../../context/WalletsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { Wallet, ColorTheme } from '../../types';
import { usePrivacyStore } from '@/store/privacyStore';

export default function WalletsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);

  const { wallets, addWallet, updateWallet, deleteWallet } = useWallets();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const { isBalancesHidden } = usePrivacyStore();

  const showToast = useCallback((message: string) => {
    setToast({ isVisible: true, message });
  }, []);

  // Memoizar la función getCurrencySymbol para evitar recrearla
  const getCurrencySymbol = useMemo(() => {
    return (currency: 'USD' | 'VES' | 'USDT' | 'EUR') => {
      switch (currency) {
        case 'USD':
          return '$';
        case 'VES':
          return 'Bs.';
        case 'USDT':
          return 'USDT';
        case 'EUR':
          return '€';
        default:
          return currency;
      }
    };
  }, []);

  // Memoizar las funciones de manejo de eventos
  const handleAddNew = useCallback(() => {
    setEditingWallet(null);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((wallet: Wallet) => {
    setEditingWallet(wallet);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Eliminar Billetera',
        '¿Estás seguro? Esta acción no se puede deshacer y borrará la billetera permanentemente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              deleteWallet(id);
              showToast('Billetera eliminada con éxito');
            },
          },
        ],
      );
    },
    [deleteWallet, showToast],
  );

  // Memoizar la función handleSubmit
  const handleSubmit = useCallback(
    (walletData: Omit<Wallet, 'id'>) => {
      const isEditing = !!editingWallet;
      if (isEditing) {
        updateWallet({ ...editingWallet, ...walletData });
      } else {
        addWallet(walletData);
      }
      showToast(isEditing ? 'Billetera actualizada con éxito' : 'Billetera creada con éxito');
    },
    [editingWallet, updateWallet, addWallet, showToast],
  );

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Mis Billeteras</Text>
        <TouchableOpacity onPress={handleAddNew}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={wallets}
        keyExtractor={useCallback((item: Wallet) => item.id, [])}
        style={styles.list}
        renderItem={useCallback(
          ({ item }: { item: Wallet }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBalance}>
                  {getCurrencySymbol(item.currency)} {isBalancesHidden ? '***' : item.balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                  <IconSymbol name="pencil" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                  <IconSymbol name="trash" size={22} color={colors.notification} />
                </TouchableOpacity>
              </View>
            </View>
          ),
          [handleEdit, handleDelete, getCurrencySymbol, styles, colors, isBalancesHidden],
        )}
        ListEmptyComponent={useMemo(
          () => (
            <Text style={styles.emptyText}>Aún no has añadido ninguna billetera.</Text>
          ),
          [styles.emptyText],
        )}
      />
      <WalletModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingWallet}
      />
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
    list: { flex: 1, width: '100%' },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    itemBalance: { fontSize: 15, color: colors.primary, marginTop: 4 },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: 8,
      marginLeft: 4,
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.text, opacity: 0.6 },
  });
