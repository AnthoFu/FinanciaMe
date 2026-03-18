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
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  navigateTo?: string;
  spotlightElement?: string;
  showSpotlight?: boolean;
  highlightTab?: string; // Nombre del tab a iluminar
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
  const [spotlightAnim] = useState(new Animated.Value(0));
  const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

  const tutorialSteps: TutorialStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: '¡Bienvenido a FinanciaMe!',
        description:
          'Tu asistente financiero personal. Comencemos un rápido recorrido para que conozcas todo lo que puedes hacer.',
        position: 'top',
      },
      {
        id: 'wallets',
        title: 'Billeteras: Tu Dinero, Organizado',
        description:
          'Piensa en las billeteras como tus cuentas bancarias o el efectivo que manejas. Crea una para empezar a registrar tus movimientos.',
        position: 'bottom',
        navigateTo: '/tabs/wallets',
        highlightTab: 'wallets',
      },
      {
        id: 'transactions',
        title: 'Transacciones: Sigue el Flujo',
        description:
          'Aquí es donde todo sucede. Registra tus ingresos y gastos diarios. ¡No dejes que se te escape ni un centavo!',
        position: 'bottom',
        navigateTo: '/tabs',
        highlightTab: 'index',
      },
      {
        id: 'budgets',
        title: 'Presupuestos: Gasta con Inteligencia',
        description:
          '¿Quieres controlar tus gastos en "Comida" o "Transporte"? Crea presupuestos y asegúrate de no excederte.',
        position: 'bottom',
        navigateTo: '/tabs/budgets',
        highlightTab: 'budgets',
      },
      {
        id: 'goals',
        title: 'Metas de Ahorro: Cumple tus Sueños',
        description:
          'Ahorrar para ese viaje o un nuevo teléfono es más fácil si tienes una meta. Define un objetivo y ve tu progreso.',
        position: 'bottom',
        navigateTo: '/tabs/goals',
        highlightTab: 'goals',
      },
      {
        id: 'fixed-expenses',
        title: 'Gastos Fijos: Pagos sin Estrés',
        description:
          'Configura pagos recurrentes como el alquiler o suscripciones. Te avisaremos antes de la fecha para que no lo olvides.',
        position: 'bottom',
        navigateTo: '/tabs/fixedExpenses',
        highlightTab: 'fixedExpenses',
      },
      {
        id: 'metrics',
        title: 'Métricas: Entiende tus Hábitos',
        description:
          '¿A dónde se va tu dinero? Los gráficos te mostrarán tus patrones de gasto para que tomes mejores decisiones.',
        position: 'bottom',
        navigateTo: '/tabs/metrics',
        highlightTab: 'metrics',
      },
      {
        id: 'complete',
        title: '¡Todo Listo!',
        description:
          'Ya tienes lo esencial para tomar el control de tus finanzas. ¡Explora la app y empieza a construir tu futuro financiero!',
        position: 'top',
      },
    ],
    [],
  );

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

  // Navegar automáticamente cuando cambia el paso
  useEffect(() => {
    if (isVisible && currentStep > 0) {
      const currentStepData = tutorialSteps[currentStep];
      if (currentStepData.navigateTo) {
        // Pequeño delay para que se vea la transición
        setTimeout(() => {
          router.push(currentStepData.navigateTo as any);
        }, 100);
      }
    }
  }, [currentStep, isVisible, router, tutorialSteps]);

  // Manejar el spotlight del tab
  useEffect(() => {
    const currentStepData = tutorialSteps[currentStep];

    if (currentStepData.highlightTab) {
      setHighlightedTab(currentStepData.highlightTab);
      // Hacer el spotlight completamente visible
      Animated.timing(spotlightAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setHighlightedTab(null);
      Animated.timing(spotlightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, spotlightAnim, tutorialSteps]);

  const handleNext = () => {
    const currentStepData = tutorialSteps[currentStep];

    // Navegar a la pantalla correspondiente si está definida
    if (currentStepData.navigateTo) {
      router.push(currentStepData.navigateTo as any);
    }

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const previousStep = currentStep - 1;
      const previousStepData = tutorialSteps[previousStep];

      // Navegar a la pantalla del paso anterior si está definida
      if (previousStepData.navigateTo) {
        router.push(previousStepData.navigateTo as any);
      }

      setCurrentStep(previousStep);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.container}>
          {/* Tutorial content */}
          <View style={styles.tutorialContent}>
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepDescription}>{currentStepData.description}</Text>

              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                {tutorialSteps.map((_, index) => (
                  <View key={index} style={[styles.progressDot, index === currentStep && styles.progressDotActive]} />
                ))}
              </View>

              {/* Navigation buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Omitir</Text>
                </TouchableOpacity>

                <View style={styles.navigationButtons}>
                  {!isFirstStep && (
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePrevious}>
                      <IconSymbol name="chevron.left" size={16} color={colors.text} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
                    <Text style={styles.primaryButtonText}>{isLastStep ? 'Comenzar' : 'Siguiente'}</Text>
                    {!isLastStep && <IconSymbol name="chevron.right" size={16} color={colors.primaryButtonText} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Tab Spotlight */}
        <TabSpotlight highlightedTab={highlightedTab} spotlightAnim={spotlightAnim} colors={colors} />
      </Animated.View>
    </Modal>
  );
};
