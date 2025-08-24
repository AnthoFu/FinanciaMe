import React from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';

// Placeholder for Fixed Expense Type
interface FixedExpense {
  id: string;
  name: string;
  amount: number;
}

const placeholderExpenses: FixedExpense[] = [
  { id: '1', name: 'Alquiler', amount: 500 },
  { id: '2', name: 'Netflix', amount: 15 },
];

export default function FixedExpensesScreen() {
  // TODO: Implement state and logic for fixed expenses

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos Fijos</Text>
      <FlatList
        data={placeholderExpenses} // Using placeholder data for now
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes gastos fijos definidos.</Text>}
      />
      <Button title="Añadir Gasto Fijo" onPress={() => alert('Próximamente!')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1D3D47',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
});
