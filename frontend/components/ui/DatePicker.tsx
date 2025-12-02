// components/ui/DatePicker.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
}

export default function DatePicker({ value, onChange, label, placeholder, minimumDate }: DatePickerProps) {
  const { theme } = useTheme(); // 👈 Hook dynamique
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    } else if (event.type === 'dismissed') {
      setShow(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder || 'Sélectionner une date';
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const clearDate = () => {
    onChange(null);
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.neutral[300],
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    placeholderText: {
      flex: 1,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.neutral[400],
    },
    dateText: {
      flex: 1,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.weights.medium,
    },
    clearButton: {
      padding: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShow(true)}>
          <Ionicons name="calendar-outline" size={20} color={value ? theme.colors.primary[500] : theme.colors.neutral[400]} />
          <Text style={value ? styles.dateText : styles.placeholderText}>{formatDate(value)}</Text>
        </TouchableOpacity>

        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={clearDate}>
            <Ionicons name="close-circle" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate || new Date()}
          locale="fr-FR"
        />
      )}
    </View>
  );
}