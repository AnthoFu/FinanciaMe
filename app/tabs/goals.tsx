import { useTheme } from '@react-navigation/native';
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
import { getThemedStyles } from '../../styles/themedStyles';
import { SavingsGoal } from '../../types';

// A simple progress bar component
const ProgressBar = ({ progress, color }: { progress: number; color: string }) => {
  const styles = getStyles({} as any); // Empty colors, just for the container style
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

const GoalItem = ({ goal, onAddContribution }: { goal: SavingsGoal; onAddContribution: () => void }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { getGoalProgress } = useSavingsGoals();
  const currentAmount = getGoalProgress(goal.id);
  const progress = goal.targetAmount > 0 ? currentAmount / goal.targetAmount : 0;

  return (
    <View style={styles.goalItemContainer}>
      <View style={styles.goalInfo}>
        <Text style={styles.goalName}>{goal.name}</Text>
        <Text style={styles.goalAmount}>
          {currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} {goal.currency}
        </Text>
      </View>
      <ProgressBar progress={progress} color={colors.primary} />
      <View style={styles.goalActions}>
        <Button title="Añadir Ahorro" onPress={onAddContribution} color={colors.primary} />
      </View>
    </View>
  );
};

export default function GoalsScreen() {
  const { colors } = useTheme();
  const globalStyles = getThemedStyles(colors);
  const styles = getStyles(colors);

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
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
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

const getStyles = (colors: any) =>
  StyleSheet.create({
    goalItemContainer: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: colors.text,
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
      color: colors.text,
    },
    goalAmount: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
      marginTop: 5,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
    },
    goalActions: {
      marginTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      alignItems: 'flex-end',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: colors.text,
      opacity: 0.6,
    },
  });
