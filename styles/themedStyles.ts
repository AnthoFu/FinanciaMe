import { StyleSheet } from 'react-native';

export const getThemedStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      backgroundColor: colors.background, // Themed
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text, // Themed
    },
    errorText: {
      color: colors.notification, // Themed (usually red)
      fontSize: 16,
      textAlign: 'center',
    },
  });
