import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { ContributionModal } from '../../components/ContributionModal';
import { GoalModal } from '../../components/GoalModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { styles as globalStyles } from '../../styles/styles';
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Metas de Ahorro</Text>
        <TouchableOpacity onPress={() => setIsGoalModalVisible(true)}>
          <IconSymbol name="plus.circle.fill" size={32} color="#1D3D47" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={savingsGoals}
        renderItem={({ item }) => <GoalItem goal={item} onAddContribution={() => handleOpenContributionModal(item)} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes metas de ahorro. ¡Crea una!</Text>}
      />
      <GoalModal isVisible={isGoalModalVisible} onClose={() => setIsGoalModalVisible(false)} />
      <ContributionModal
        isVisible={isContributionModalVisible}
        onClose={() => setIsContributionModalVisible(false)}
        goal={selectedGoal}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
