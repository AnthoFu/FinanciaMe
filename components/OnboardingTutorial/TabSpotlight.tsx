import React from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

interface TabSpotlightProps {
  highlightedTab: string | null;
  spotlightAnim: Animated.Value;
  colors: any;
}

// Mapeo de tabs a sus índices en el navbar
const TAB_INDICES = {
  index: 0, // Home
  goals: 1, // Metas
  budgets: 2, // Presupuestos
  fixedExpenses: 3, // Gastos Fijos
  wallets: 4, // Billeteras
  metrics: 5, // Métricas
};

// Función para calcular la posición del spotlight
const calculateSpotlightPosition = (tabName: string): number => {
  const { width } = Dimensions.get('window');
  const tabIndex = TAB_INDICES[tabName as keyof typeof TAB_INDICES];

  // Calcular el ancho de cada tab
  const totalTabs = 6;
  const tabWidth = width / totalTabs;

  // Calcular la posición centrada del tab
  const tabCenter = tabIndex * tabWidth + tabWidth / 2;

  // Ajustar para centrar el spotlight (que tiene 70px de ancho)
  const spotlightWidth = 70;
  const leftPosition = tabCenter - spotlightWidth / 2;

  return Math.max(0, leftPosition); // Asegurar que no sea negativo
};

export const TabSpotlight: React.FC<TabSpotlightProps> = ({ highlightedTab, spotlightAnim, colors }) => {
  if (!highlightedTab || !TAB_INDICES[highlightedTab as keyof typeof TAB_INDICES]) {
    return null;
  }

  const leftPosition = calculateSpotlightPosition(highlightedTab);

  return (
    <Animated.View
      style={[
        styles.spotlight,
        {
          left: leftPosition,
          backgroundColor: '#007AFF', // Azul iOS elegante
          shadowColor: '#007AFF',
          opacity: spotlightAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  spotlight: {
    position: 'absolute',
    bottom: 75, // Posición justo encima del navbar
    width: 70, // Un poco más ancho
    height: 6, // Un poco más alto
    borderRadius: 3,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 9999, // Asegurar que esté encima
  },
});
