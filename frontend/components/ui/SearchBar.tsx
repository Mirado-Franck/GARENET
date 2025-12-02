// components/ui/SearchBar.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: any;
}

export default function SearchBar({
  placeholder = 'Rechercher...',
  onSearch,
  onClear,
  autoFocus = false,
  style,
}: SearchBarProps) {
  const { theme } = useTheme(); // 👈 Hook dynamique
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.md,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.neutral[300],
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.md,
      ...theme.shadows.sm,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.primary,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    searchButton: {
      backgroundColor: theme.colors.primary[500],
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    searchButtonDisabled: {
      backgroundColor: theme.colors.neutral[300],
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={theme.colors.text.tertiary}
          style={styles.searchIcon} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={handleChangeText}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          placeholderTextColor={theme.colors.text.tertiary}
        />
        
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.searchButton,
          query.length === 0 && styles.searchButtonDisabled
        ]} 
        onPress={handleSearch}
        disabled={query.length === 0}
      >
        <Ionicons 
          name="arrow-forward" 
          size={20} 
          color={
            query.length === 0 
              ? theme.colors.neutral[400]
              : theme.colors.text.inverse
          } 
        />
      </TouchableOpacity>
    </View>
  );
}