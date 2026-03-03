import { useTheme } from '@/hooks/useTheme';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from '../../components/Toast';
import { IconSymbol } from '../../components/ui/IconSymbol';
import WalletModal from '../../components/WalletModal';
import { useWallets } from '../../context/WalletsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { Wallet, ColorTheme } from '../../types';

export default function WalletsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const globalStyles = getThemedStyles(colors);

  const { wallets, addWallet, updateWallet, deleteWallet } = useWallets();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const showToast = useCallback((message: string) => {
    setToast({ isVisible: true, message });
  }, []);

  // Memoizar la función getCurrencySymbol para evitar recrearla
  const getCurrencySymbol = useMemo(() => {
    return (currency: 'USD' | 'VES' | 'USDT') => {
      switch (currency) {
        case 'USD':
          return '$';
        case 'VES':
          return 'Bs.';
        case 'USDT':
          return 'USDT';
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
                  {getCurrencySymbol(item.currency)} {item.balance.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  Alert.alert('Acciones', '¿Qué deseas hacer con esta billetera?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Editar', onPress: () => handleEdit(item) },
                    { text: 'Eliminar', style: 'destructive', onPress: () => handleDelete(item.id) },
                  ]);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="ellipsis.vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          [handleEdit, handleDelete, getCurrencySymbol, styles, colors.text],
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
    menuButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      padding: 8,
      zIndex: 1,
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.text, opacity: 0.6 },
  });
