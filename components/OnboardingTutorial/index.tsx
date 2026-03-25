import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { getOnboardingStyles } from './styles';
import { TabSpotlight } from './TabSpotlight';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'center';
  navigateTo?: string;
  highlightTab?: string;
}

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ isVisible, onComplete, onSkip }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = getOnboardingStyles(colors);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(20));
  const [spotlightAnim] = useState(new Animated.Value(0));
  const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

  const tutorialSteps: TutorialStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: '¡Bienvenido a FinanciaMe!',
        description:
          'Tu asistente financiero personal. Comencemos un rápido recorrido para que conozcas todo lo que puedes hacer.',
        position: 'center',
      },
      {
        id: 'wallets',
        title: 'Billeteras: Tu Dinero, Organizado',
        description:
          'Piensa en las billeteras como tus cuentas bancarias o el efectivo que manejas. Crea una para empezar a registrar tus movimientos.',
        position: 'center',
        navigateTo: '/tabs/wallets',
        highlightTab: 'wallets',
      },
      {
        id: 'transactions',
        title: 'Transacciones: Sigue el Flujo',
        description:
          'Aquí es donde todo sucede. Registra tus ingresos y gastos diarios. ¡No dejes que se te escape ni un centavo!',
        position: 'center',
        navigateTo: '/tabs',
        highlightTab: 'index',
      },
      {
        id: 'budgets',
        title: 'Presupuestos: Gasta con Inteligencia',
        description:
          '¿Quieres controlar tus gastos en "Comida" o "Transporte"? Crea presupuestos y asegúrate de no excederte.',
        position: 'center',
        navigateTo: '/tabs/budgets',
        highlightTab: 'budgets',
      },
      {
        id: 'goals',
        title: 'Metas de Ahorro: Cumple tus Sueños',
        description:
          'Ahorrar para ese viaje o un nuevo teléfono es más fácil si tienes una meta. Define un objetivo y ve tu progreso.',
        position: 'center',
        navigateTo: '/tabs/goals',
        highlightTab: 'goals',
      },
      {
        id: 'fixed-expenses',
        title: 'Gastos Fijos: Pagos sin Estrés',
        description:
          'Configura pagos recurrentes como el alquiler o suscripciones. Te avisaremos antes de la fecha para que no lo olvides.',
        position: 'center',
        navigateTo: '/tabs/fixedExpenses',
        highlightTab: 'fixedExpenses',
      },
      {
        id: 'metrics',
        title: 'Métricas: Entiende tus Hábitos',
        description:
          '¿A dónde se va tu dinero? Los gráficos te mostrarán tus patrones de gasto para que tomes mejores decisiones.',
        position: 'center',
        navigateTo: '/tabs/metrics',
        highlightTab: 'metrics',
      },
      {
        id: 'complete',
        title: '¡Todo Listo!',
        description:
          'Ya tienes lo esencial para tomar el control de tus finanzas. ¡Explora la app y empieza a construir tu futuro financiero!',
        position: 'center',
      },
    ],
    [],
  );

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim, contentTranslateY]);

  // Manejar cambios de paso con animaciones
  useEffect(() => {
    if (!isVisible) return;

    const currentStepData = tutorialSteps[currentStep];

    // Navegar si es necesario
    if (currentStepData.navigateTo) {
      setTimeout(() => {
        router.push(currentStepData.navigateTo as any);
      }, 100);
    }

    // Manejar Spotlight
    if (currentStepData.highlightTab) {
      setHighlightedTab(currentStepData.highlightTab);
      Animated.spring(spotlightAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(spotlightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setHighlightedTab(null));
    }
  }, [currentStep, isVisible, router, spotlightAnim, tutorialSteps]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      // Pequeña animación de feedback al cambiar
      contentTranslateY.setValue(10);
      Animated.spring(contentTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      contentTranslateY.setValue(-10);
      Animated.spring(contentTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  if (!isVisible) return null;

  const getContentStyle = () => {
    switch (currentStepData.position) {
      case 'top':
        return styles.contentTop;
      case 'bottom':
        return styles.contentBottom;
      default:
        return {};
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <Animated.View
            style={[
              styles.tutorialContent,
              getContentStyle(),
              {
                opacity: fadeAnim,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepDescription}>{currentStepData.description}</Text>

              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                {tutorialSteps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentStep && styles.progressDotActive,
                      { backgroundColor: index <= currentStep ? colors.tint : colors.border },
                    ]}
                  />
                ))}
              </View>

              {/* Navigation buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Omitir</Text>
                </TouchableOpacity>

                <View style={styles.navigationButtons}>
                  {!isFirstStep && (
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePrevious}>
                      <IconSymbol name="chevron.left" size={20} color={colors.text} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
                    <Text style={styles.primaryButtonText}>{isLastStep ? '¡Vamos!' : 'Siguiente'}</Text>
                    {!isLastStep && <IconSymbol name="chevron.right" size={18} color={colors.primaryButtonText} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>

        {/* Tab Spotlight */}
        <TabSpotlight highlightedTab={highlightedTab} spotlightAnim={spotlightAnim} colors={colors} />
      </View>
    </Modal>
  );
};
