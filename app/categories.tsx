import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { useCategories } from '../context/CategoriesContext';
import { IconSymbol } from '../components/ui/IconSymbol';
import { CATEGORY_ICONS } from '../constants/Icons';

export default function CategoriesScreen() {
  const { categories, addCategory, removeCategory } = useCategories();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío.');
      return;
    }
    addCategory(newCategoryName, selectedIcon, selectedType);
    setNewCategoryName('');
    setModalVisible(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    Alert.alert(
      'Eliminar Categoría',
      '¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeCategory(categoryId) },
      ]
    );
  };

  const sections = useMemo(() => {
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const data = [];
    if (incomeCategories.length > 0) {
      data.push({ title: 'Ingresos', data: incomeCategories });
    }
    if (expenseCategories.length > 0) {
      data.push({ title: 'Gastos', data: expenseCategories });
    }
    return data;
  }, [categories]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <IconSymbol name={item.icon} size={24} color="#1D3D47" />
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveCategory(item.id)}>
              <IconSymbol name="trash.fill" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <IconSymbol name="plus.circle.fill" size={22} color="#007AFF" />
            <Text style={styles.addButtonText}>Añadir Nueva Categoría</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Categoría</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'expense' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('expense')}
              >
                <Text style={[styles.typeButtonText, selectedType === 'expense' && styles.typeButtonTextSelected]}>Gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'income' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('income')}
              >
                <Text style={[styles.typeButtonText, selectedType === 'income' && styles.typeButtonTextSelected]}>Ingreso</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <Text style={styles.iconSelectorTitle}>Selecciona un Icono</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelector}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconWrapper, selectedIcon === icon && styles.iconWrapperSelected]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <IconSymbol name={icon} size={28} color={selectedIcon === icon ? '#FFF' : '#1D3D47'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddCategory}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 10,
    marginTop: 20,
  },
  // Category List
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  categoryName: {
    fontSize: 16,
    color: '#1D3D47',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0F2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1D3D47',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f0f4f7',
    borderRadius: 10,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  input: {
    width: '100%',
    backgroundColor: '#f0f4f7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  iconSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  iconSelector: {
    width: '100%',
    marginBottom: 20,
  },
  iconWrapper: {
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: '#E8F0F2',
  },
  iconWrapperSelected: {
    backgroundColor: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E8F0F2',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});