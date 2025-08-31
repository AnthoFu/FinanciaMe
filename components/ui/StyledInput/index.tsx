import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { styles } from './styles';

export function StyledInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]} // Allows for overriding styles
      placeholderTextColor="#888" // A nice default placeholder color
    />
  );
}
