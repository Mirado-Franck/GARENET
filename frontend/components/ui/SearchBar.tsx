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
    // Recherche en temps réel optionnelle
    // onSearch(text);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        {/* Icône de recherche */}
        <Ionicons 
          name="search" 
          size={20} 
          color="#666" 
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
          placeholderTextColor="#999"
        />
        
        {/* Bouton effacer */}
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Bouton de recherche (optionnel) */}
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
          color={query.length === 0 ? '#CCC' : 'white'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});