import React from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

import { ColorTheme } from '../../types';

interface TabSpotlightProps {
  highlightedTab: string | null;
  spotlightAnim: Animated.Value;
  colors: ColorTheme;
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

  // Calcular la posición centrada del tab con un pequeño ajuste de 2px a la izquierda
  // para compensar el renderizado del navbar en Android
  const tabCenter = tabIndex * tabWidth + tabWidth / 2 - 2;

  // Ajustar para centrar el círculo (66px de diámetro)
  const spotlightDiameter = 66;
  const leftPosition = tabCenter - spotlightDiameter / 2;

  return leftPosition;
};

export const TabSpotlight: React.FC<TabSpotlightProps> = ({ highlightedTab, spotlightAnim, colors }) => {
  if (!highlightedTab || TAB_INDICES[highlightedTab as keyof typeof TAB_INDICES] === undefined) {
    return null;
  }

  const leftPosition = calculateSpotlightPosition(highlightedTab);

  return (
    <Animated.View
      style={[
        styles.spotlight,
        {
          left: leftPosition,
          backgroundColor: `${colors.tint}22`,
          borderColor: colors.tint,
          shadowColor: colors.tint,
          opacity: spotlightAnim,
          transform: [
            {
              scale: spotlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  spotlight: {
    position: 'absolute',
    bottom: 40, // Elevado lo justo para no chocar con el borde del sistema
    width: 66, // Un poco más pequeño para dar margen
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    elevation: 0,
    zIndex: 9999,
  },
});
