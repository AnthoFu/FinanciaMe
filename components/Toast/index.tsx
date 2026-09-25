import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet, Modal } from 'react-native';
import { styles } from './styles';

export type ToastType = 'info' | 'success' | 'error';
export type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number | null;
  onHide: () => void;
}

export default function Toast({
  message,
  isVisible,
  type = 'info',
  position = 'bottom',
  duration = 2000,
  onHide,
}: ToastProps) {
  const [fadeAnim] = React.useState(() => new Animated.Value(0));

  const hide = React.useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  }, [fadeAnim, onHide]);

  useEffect(() => {
    if (isVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Only set timer if duration is provided (not null)
      if (duration !== null) {
        const timer = setTimeout(() => {
          hide();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      fadeAnim.setValue(0);
    }
  }, [isVisible, duration, fadeAnim, hide]);

  if (!isVisible) {
    return null;
  }

  const typeStyle = styles[type] || styles.info;
  const positionStyle = styles[position] || styles.bottom;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={hide}>
      <View style={localStyles.overlay} pointerEvents="box-none">
        <Animated.View style={[styles.container, typeStyle, positionStyle, { opacity: fadeAnim }]} pointerEvents="auto">
          <Text style={styles.message}>{message}</Text>
          {duration === null && (
            <TouchableOpacity onPress={hide} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    zIndex: 999999,
  },
});
