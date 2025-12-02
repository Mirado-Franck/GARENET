// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeKey, getThemeConfig } from '../constants/themes';

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeContextType {
  currentThemeKey: ThemeKey;
  theme: ReturnType<typeof getThemeConfig>;
  setTheme: (themeKey: ThemeKey) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeKey, setCurrentThemeKey] = useState<ThemeKey>('blue');
  const [isLoading, setIsLoading] = useState(true);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && isValidThemeKey(savedTheme)) {
        setCurrentThemeKey(savedTheme as ThemeKey);
      }
    } catch (error) {
      console.error('❌ Erreur chargement thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeKey: ThemeKey) => {
    try {
      console.log('🎨 Changement de thème:', themeKey);
      setCurrentThemeKey(themeKey);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeKey);
      console.log('✅ Thème sauvegardé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde thème:', error);
      throw error;
    }
  };

  const isValidThemeKey = (key: string): boolean => {
    return ['blue', 'green', 'purple', 'orange', 'red', 'dark'].includes(key);
  };

  const theme = getThemeConfig(currentThemeKey);

  const value: ThemeContextType = {
    currentThemeKey,
    theme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
  }
  return context;
};