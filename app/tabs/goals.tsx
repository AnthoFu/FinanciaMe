import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

import { ContributionModal } from '../../components/ContributionModal';
import { GoalModal } from '../../components/GoalModal';
import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { SavingsGoal } from '../../types';

// A simple progress bar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
  </View>
);

const GoalItem = ({ goal, onAddContribution }: { goal: SavingsGoal; onAddContribution: () => void }) => {
  const { getContributionsForGoal } = useSavingsGoals();
  const contributions = getContributionsForGoal(goal.id);
  const currentAmount = contributions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const progress = goal.targetAmount > 0 ? currentAmount / goal.targetAmount : 0;

  return (
    <View style={styles.goalItemContainer}>
      <View style={styles.goalInfo}>
        <Text style={styles.goalName}>{goal.name}</Text>
        <Text style={styles.goalAmount}>
          {currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} {goal.currency}
        </Text>
      </View>
      <ProgressBar progress={progress} />
      <View style={styles.goalActions}>
        <Button title="Añadir Ahorro" onPress={onAddContribution} />
      </View>
    </View>
  );
};

export default function GoalsScreen() {
  const { savingsGoals } = useSavingsGoals();
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isContributionModalVisible, setIsContributionModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const handleOpenContributionModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributionModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Metas de Ahorro</Text>
        <Button title="Agregar Meta" onPress={() => setIsGoalModalVisible(true)} />
      </View>
      <FlatList
        data={savingsGoals}
        renderItem={({ item }) => <GoalItem goal={item} onAddContribution={() => handleOpenContributionModal(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes metas de ahorro. ¡Crea una!</Text>}
      />
      <GoalModal isVisible={isGoalModalVisible} onClose={() => setIsGoalModalVisible(false)} />
      <ContributionModal
        isVisible={isContributionModalVisible}
        onClose={() => setIsContributionModalVisible(false)}
        goal={selectedGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  goalItemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalInfo: {
    marginBottom: 10,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalAmount: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  goalActions: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
