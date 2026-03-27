import { StyleSheet } from 'react-native';
import { ColorTheme } from '../../types';

export const getStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    modalContent: {
      width: '94%',
      maxHeight: '85%',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    scrollView: {
      width: '100%',
    },
    scrollViewContent: {
      paddingBottom: 20,
      paddingRight: 12, // Espacio para que el scrollbar no tape el contenido y sea más visible
    },
    modalTitle: { 
      fontSize: 22, 
      fontWeight: '700', 
      marginBottom: 20, 
      textAlign: 'center', 
      color: colors.text 
    },
    section: {
      marginBottom: 16,
      width: '100%',
    },
    currencySelector: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      height: 46,
      width: '100%',
      marginTop: 8,
      backgroundColor: colors.background,
    },
    currencyOption: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    currencyOptionSelected: { 
      backgroundColor: colors.primary,
    },
    currencyText: { 
      fontSize: 14, 
      color: colors.text, 
      fontWeight: '500' 
    },
    currencyTextSelected: { 
      color: '#FFFFFF', 
      fontWeight: 'bold' 
    },
    pickerLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
      marginBottom: 10,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      backgroundColor: colors.background,
    },
    categoryItemSelected: { 
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryItemText: { 
      color: colors.text, 
      fontSize: 14 
    },
    categoryItemTextSelected: { 
      color: '#FFFFFF', 
      fontWeight: '600' 
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      width: '100%',
    },
    dateTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
    },
    dateTriggerText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
    },
    clearButton: {
      width: 40,
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
  });