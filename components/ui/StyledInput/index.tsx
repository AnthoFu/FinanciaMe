import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { getStyles } from './styles';

export function StyledInput(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]} // Allows for overriding styles
      placeholderTextColor={colors.text} // Use theme color for placeholder
      selectionColor={colors.primary} // Use theme color for selection cursor
    />
  );
}
