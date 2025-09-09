import { useTheme } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { CATEGORY_ICONS } from '../constants/Icons';
import { useCategories } from '../context/CategoriesContext';
import { IconSymbol } from '../components/ui/IconSymbol';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
      ],
    );
  };

  const sections = useMemo(() => {
    const incomeCategories = categories.filter((c) => c.type === 'income');
    const expenseCategories = categories.filter((c) => c.type === 'expense');
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
              <IconSymbol name={item.icon as any} size={24} color={colors.text} />
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveCategory(item.id)}>
              <IconSymbol name="trash.fill" size={20} color={colors.notification} />
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <IconSymbol name="plus.circle.fill" size={22} color={colors.primary} />
            <Text style={styles.addButtonText}>Añadir Nueva Categoría</Text>
          </TouchableOpacity>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Categoría</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'expense' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('expense')}
              >
                <Text style={[styles.typeButtonText, selectedType === 'expense' && styles.typeButtonTextSelected]}>
                  Gasto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'income' && styles.typeButtonSelected]}
                onPress={() => setSelectedType('income')}
              >
                <Text style={[styles.typeButtonText, selectedType === 'income' && styles.typeButtonTextSelected]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.text}
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
                  <IconSymbol name={icon as any} size={28} color={selectedIcon === icon ? colors.card : colors.text} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancelar</Text>
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

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      marginTop: 20,
    },
    // Category List
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      gap: 10,
    },
    addButtonText: {
      fontSize: 16,
      color: colors.primary,
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
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    typeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 20,
      backgroundColor: colors.background,
      borderRadius: 10,
    },
    typeButton: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
    },
    typeButtonSelected: {
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    typeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    typeButtonTextSelected: {
      color: colors.card,
    },
    input: {
      width: '100%',
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 10,
      marginBottom: 20,
      fontSize: 16,
      color: colors.text,
    },
    iconSelectorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
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
      backgroundColor: colors.border,
    },
    iconWrapperSelected: {
      backgroundColor: colors.primary,
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
      backgroundColor: colors.border,
      marginRight: 10,
    },
    saveButton: {
      backgroundColor: colors.primary,
      marginLeft: 10,
    },
    modalButtonText: {
      color: colors.card,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
