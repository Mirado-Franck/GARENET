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
import { theme } from '../../constants/theme'; // 👈 IMPORT DU THÈME

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

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        {/* Icône de recherche */}
        <Ionicons 
          name="search" 
          size={20} 
          color={theme.colors.text.tertiary} // 👈 UTILISATION DU THÈME
          style={styles.searchIcon} 
        />
        
        {/* Champ de recherche */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={handleChangeText}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          placeholderTextColor={theme.colors.text.tertiary} // 👈 UTILISATION DU THÈME
        />
        
        {/* Bouton effacer */}
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={theme.colors.text.tertiary} // 👈 UTILISATION DU THÈME
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Bouton de recherche */}
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
              ? theme.colors.neutral[400] // 👈 UTILISATION DU THÈME
              : theme.colors.text.inverse  // 👈 UTILISATION DU THÈME
          } 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md, // 👈 UTILISATION DU THÈME
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary, // 👈 UTILISATION DU THÈME
    borderRadius: theme.borderRadius.md, // 👈 UTILISATION DU THÈME
    borderWidth: 1,
    borderColor: theme.colors.neutral[300], // 👈 UTILISATION DU THÈME
    paddingHorizontal: theme.spacing.md, // 👈 UTILISATION DU THÈME
    marginRight: theme.spacing.md, // 👈 UTILISATION DU THÈME
    ...theme.shadows.sm, // 👈 UTILISATION DU THÈME
  },
  searchIcon: {
    marginRight: theme.spacing.sm, // 👈 UTILISATION DU THÈME
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md, // 👈 UTILISATION DU THÈME
    fontSize: theme.typography.sizes.body, // 👈 UTILISATION DU THÈME
    color: theme.colors.text.primary, // 👈 UTILISATION DU THÈME
  },
  clearButton: {
    padding: theme.spacing.xs, // 👈 UTILISATION DU THÈME
  },
  searchButton: {
    backgroundColor: theme.colors.primary[500], // 👈 BLEU DU THÈME (plus vert)
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md, // 👈 UTILISATION DU THÈME
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm, // 👈 UTILISATION DU THÈME
  },
  searchButtonDisabled: {
    backgroundColor: theme.colors.neutral[300], // 👈 UTILISATION DU THÈME
  },
});