import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletModal, { Wallet } from '../../components/WalletModal';

const WALLETS_KEY = 'userWallets';

export default function WalletsScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

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
          onPress: () => setWallets(prev => prev.filter(w => w.id !== id))
          // TODO: Future improvement -> check if wallet has transactions and prevent deletion or re-assign them.
        },
      ]
    );
  };

  const handleSubmit = (walletData: Omit<Wallet, 'id'>) => {
    if (editingWallet) {
      // Update existing wallet
      setWallets(prev => 
        prev.map(w => w.id === editingWallet.id ? { ...w, name: walletData.name } : w)
      );
    } else {
      // Add new wallet
      const newWallet: Wallet = {
        id: Date.now().toString(),
        ...walletData,
      };
      setWallets(prev => [...prev, newWallet]);
    }
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
      <Button title="Añadir Billetera" onPress={handleAddNew} />
      <WalletModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingWallet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1D3D47' },
  list: { flex: 1, width: '100%' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemBalance: { fontSize: 16, color: '#007bff', marginTop: 4 },
  itemActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 15 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#dc3545' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
});