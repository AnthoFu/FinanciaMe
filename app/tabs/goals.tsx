import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
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
  Alert,
} from 'react-native';

import { ContributionModal } from '../../components/ContributionModal';
import { GoalModal } from '../../components/GoalModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useSavingsGoals } from '../../context/SavingsGoalsContext';
import { getThemedStyles } from '../../styles/themedStyles';
import { SavingsGoal, ColorTheme } from '../../types';

// A simple progress bar component
const progressBarStyles = StyleSheet.create({
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});

const ProgressBar = ({
  progress,
  color,
  backgroundColor,
}: {
  progress: number;
  color: string;
  backgroundColor: string;
}) => {
  return (
    <View style={[progressBarStyles.progressBarContainer, { backgroundColor }]}>
      <View style={[progressBarStyles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

const GoalItem = ({
  goal,
  onAddContribution,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onAddContribution: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { getGoalProgress } = useSavingsGoals();
  const currentAmount = getGoalProgress(goal.id);
  const progress = goal.targetAmount > 0 ? currentAmount / goal.targetAmount : 0;

  return (
    <View style={styles.goalItemContainer}>
      <View style={styles.goalHeader}>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalAmount}>
            Ahorrado: {currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} {goal.currency}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <IconSymbol name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <IconSymbol name="trash" size={20} color={colors.notification} />
          </TouchableOpacity>
        </View>
      </View>
      <ProgressBar progress={progress} color={colors.primary} backgroundColor={colors.border} />
      <View style={styles.goalActions}>
        <Button title="Añadir Ahorro" onPress={onAddContribution} color={colors.primary} />
      </View>
    </View>
  );
};

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const globalStyles = getThemedStyles(colors);
  const styles = getStyles(colors);

  const { savingsGoals, deleteSavingsGoal } = useSavingsGoals();
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isContributionModalVisible, setIsContributionModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const handleOpenContributionModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributionModalVisible(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsGoalModalVisible(true);
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    Alert.alert('Eliminar Meta', `¿Estás seguro de que quieres eliminar la meta "${goal.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteSavingsGoal(goal.id);
          showToast({ message: 'Meta eliminada con éxito', type: 'success' });
        },
      },
    ]);
  };

  const handleAddNewGoal = () => {
    setSelectedGoal(null);
    setIsGoalModalVisible(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Metas de Ahorro</Text>
        <TouchableOpacity onPress={handleAddNewGoal}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={savingsGoals}
        renderItem={({ item }) => (
          <GoalItem
            goal={item}
            onAddContribution={() => handleOpenContributionModal(item)}
            onEdit={() => handleEditGoal(item)}
            onDelete={() => handleDeleteGoal(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes metas de ahorro. ¡Crea una!</Text>}
      />
      <GoalModal isVisible={isGoalModalVisible} onClose={() => setIsGoalModalVisible(false)} goal={selectedGoal} />
      <ContributionModal
        isVisible={isContributionModalVisible}
        onClose={() => setIsContributionModalVisible(false)}
        goal={selectedGoal}
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: ColorTheme) =>
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
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    goalInfo: {
      flex: 1,
    },
    actionIcons: {
      flexDirection: 'row',
    },
    iconButton: {
      padding: 5,
      marginLeft: 10,
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
