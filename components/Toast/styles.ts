import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
