import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletModal from '../../components/WalletModal';
import Toast from '../../components/Toast';
import { WALLETS_KEY } from '../../constants/StorageKeys';
import { Wallet } from '../../types';

export default function WalletsScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  // Load wallets from storage
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const storedWallets = await AsyncStorage.getItem(WALLETS_KEY);
        if (storedWallets) {
          setWallets(JSON.parse(storedWallets));
        }
      } catch (e) {
        console.error("Failed to load wallets.", e);
      }
    };
    loadWallets();
  }, []);

  // Save wallets to storage
  useEffect(() => {
    const saveWallets = async () => {
      try {
        await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
      } catch (e) {
        console.error("Failed to save wallets.", e);
      }
    };
    saveWallets();
  }, [wallets]);

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
  };

  const handleAddNew = () => {
    setEditingWallet(null);
    setModalVisible(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar Billetera',
      '¿Estás seguro? Esta acción no se puede deshacer y borrará la billetera permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            setWallets(prev => prev.filter(w => w.id !== id));
            showToast("Billetera eliminada con éxito");
          }
        },
      ]
    );
  };

  const handleSubmit = (walletData: Omit<Wallet, 'id'>) => {
    const isEditing = !!editingWallet;
    if (isEditing) {
      // Update existing wallet
      setWallets(prev => 
        prev.map(w => w.id === editingWallet.id ? { ...w, name: walletData.name, currency: walletData.currency } : w)
      );
    } else {
      // Add new wallet
      const newWallet: Wallet = {
        id: Date.now().toString(),
        ...walletData,
      };
      setWallets(prev => [...prev, newWallet]);
    }
    showToast(isEditing ? "Billetera actualizada con éxito" : "Billetera creada con éxito");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Billeteras</Text>
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemBalance}>{item.currency === 'USD' ? '$' : 'Bs.'}{item.balance.toFixed(2)}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => handleEdit(item)}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no has añadido ninguna billetera.</Text>}
      />
      <View style={styles.buttonWrapper}>
        <Button title="Añadir Billetera" onPress={handleAddNew} />
      </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1D3D47' },
  list: { flex: 1, width: '100%' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemBalance: { fontSize: 16, color: '#007bff', marginTop: 4 },
  itemActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 15 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
  buttonWrapper: { paddingVertical: 10 },
});
