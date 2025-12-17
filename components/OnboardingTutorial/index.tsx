import { useTheme } from '@react-navigation/native';
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
        description: 'Te ayudaremos a gestionar tus finanzas personales de manera sencilla y efectiva.',
        position: 'top',
      },
      {
        id: 'wallets',
        title: '1. Crea tu Primera Billetera',
        description:
          'Primero necesitas crear una billetera para empezar. Esto te permitirá organizar tu dinero y hacer seguimiento de tus gastos.',
        position: 'bottom',
        navigateTo: '/tabs/wallets',
        highlightTab: 'wallets',
      },
      {
        id: 'transactions',
        title: '2. Registra Transacciones',
        description:
          'Ahora vamos a aprender a registrar ingresos y gastos. Esto te ayudará a saber exactamente en qué gastas tu dinero.',
        position: 'bottom',
        navigateTo: '/tabs',
        highlightTab: 'index',
      },
      {
        id: 'budgets',
        title: '3. Controla tus Presupuestos',
        description:
          'Los presupuestos te ayudan a no gastar más de lo que planeas. Puedes establecer límites por categoría como comida, transporte, etc.',
        position: 'bottom',
        navigateTo: '/tabs/budgets',
        highlightTab: 'budgets',
      },
      {
        id: 'goals',
        title: '4. Define Metas de Ahorro',
        description:
          'Las metas te ayudan a ahorrar para objetivos específicos como vacaciones, un auto, o emergencias. Es como tener un plan de ahorro.',
        position: 'bottom',
        navigateTo: '/tabs/goals',
        highlightTab: 'goals',
      },
      {
        id: 'fixed-expenses',
        title: '5. Programa Gastos Fijos',
        description:
          'Los gastos fijos son pagos que haces regularmente como renta, servicios, suscripciones. La app te recordará cuándo pagarlos.',
        position: 'bottom',
        navigateTo: '/tabs/fixedExpenses',
        highlightTab: 'fixedExpenses',
      },
      {
        id: 'metrics',
        title: '6. Analiza tus Finanzas',
        description:
          'Las métricas te muestran gráficos y estadísticas de tus gastos. Te ayudan a entender mejor tus hábitos financieros.',
        position: 'bottom',
        navigateTo: '/tabs/metrics',
        highlightTab: 'metrics',
      },
      {
        id: 'complete',
        title: '¡Listo para comenzar!',
        description: 'Ya conoces las funciones principales. ¡Empieza a gestionar tus finanzas de manera inteligente!',
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
                    {!isLastStep && <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />}
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
