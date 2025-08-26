import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { Stack } from 'expo-router';

export default function CategoriesScreen() {
  const { categories, addCategory, removeCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío.');
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      Alert.alert('Error', 'Esta categoría ya existe.');
      return;
    }
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleRemoveCategory = (category: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${category}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => removeCategory(category), style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Gestionar Categorías' }} />
      <Text style={styles.title}>Tus Categorías</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva categoría"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <Button title="Añadir" onPress={handleAddCategory} />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 40 }} // Increased bottom padding
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveCategory(item)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay categorías personalizadas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1D3D47',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20, // Added margin to separate from list
    // Removed borderTopWidth, borderTopColor, paddingTop
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});