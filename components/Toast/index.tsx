import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { styles } from './styles';

interface ToastProps {
  message: string;
  isVisible: boolean;
  duration?: number;
  onHide: () => void;
}

export default function Toast({ message, isVisible, duration = 2000, onHide }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    if (isVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fade out after duration
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide(); // Callback after fade out completes
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
        // Reset animation if component is hidden externally
        fadeAnim.setValue(0);
    }
  }, [isVisible, duration, fadeAnim, onHide]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}
