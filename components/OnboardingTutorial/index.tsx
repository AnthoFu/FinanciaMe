import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { getOnboardingStyles } from './styles';

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
}

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const { width, height } = Dimensions.get('window');

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ isVisible, onComplete, onSkip }) => {
  const { colors } = useTheme();
  const styles = getOnboardingStyles(colors);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const tutorialSteps: TutorialStep[] = [
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
        'Primero necesitas crear una billetera para empezar. Ve a la pestaña "Billeteras" y toca el botón + para crear una.',
      position: 'bottom',
    },
    {
      id: 'transactions',
      title: '2. Registra Transacciones',
      description:
        'Añade ingresos y gastos fácilmente. Ve a "Home" y toca el botón + en cualquier billetera para registrar transacciones.',
      position: 'bottom',
    },
    {
      id: 'budgets',
      title: '3. Controla tus Presupuestos',
      description:
        'Establece límites de gasto por categoría. Ve a "Presupuestos" para configurar tus límites mensuales.',
      position: 'bottom',
    },
    {
      id: 'goals',
      title: '4. Define Metas de Ahorro',
      description:
        'Establece objetivos financieros y haz seguimiento de tu progreso. Ve a "Metas" para crear tus objetivos.',
      position: 'bottom',
    },
    {
      id: 'fixed-expenses',
      title: '5. Programa Gastos Fijos',
      description:
        'Configura gastos recurrentes como renta, servicios, etc. Ve a "Gastos Fijos" y programa recordatorios automáticos.',
      position: 'bottom',
    },
    {
      id: 'metrics',
      title: '6. Analiza tus Finanzas',
      description:
        'Revisa gráficos y estadísticas de tus hábitos financieros. Ve a "Métricas" para ver análisis detallados.',
      position: 'bottom',
    },
    {
      id: 'complete',
      title: '¡Listo para comenzar!',
      description: 'Ya conoces las funciones principales. ¡Empieza a gestionar tus finanzas de manera inteligente!',
      position: 'top',
    },
  ];

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
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
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

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.container}>
          {/* Spotlight effect - solo para pasos específicos */}
          {currentStepData.showSpotlight && (
            <View style={styles.spotlight}>
              <View style={styles.spotlightHole} />
            </View>
          )}

          {/* Tutorial content */}
          <View style={[styles.tutorialContent, getPositionStyles(currentStepData.position)]}>
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
      </Animated.View>
    </Modal>
  );
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top':
      return { justifyContent: 'flex-start' as const, paddingTop: 100 };
    case 'bottom':
      return { justifyContent: 'flex-end' as const, paddingBottom: 100 };
    default:
      return { justifyContent: 'center' as const };
  }
};
