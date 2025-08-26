import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure it's on top
  },
  message: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});
