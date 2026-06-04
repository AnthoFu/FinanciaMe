import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '../IconSymbol';
import { getStyles } from './styles';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'destructive';
  icon?: string;
}

export const ConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  icon,
}: ConfirmationModalProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const defaultIcon = type === 'destructive' ? 'trash' : 'info.circle';
  const iconName = icon || defaultIcon;
  const iconColor = type === 'destructive' ? colors.notification : colors.primary;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.iconContainer}>
                <View
                  style={[StyleSheet.absoluteFill, { backgroundColor: iconColor, opacity: 0.15, borderRadius: 32 }]}
                />
                <IconSymbol name={iconName as any} size={32} color={iconColor} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, type === 'destructive' ? styles.destructiveButton : styles.confirmButton]}
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
