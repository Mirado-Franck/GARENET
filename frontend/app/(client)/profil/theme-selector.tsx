// app/(client)/profil/theme-selector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition des thèmes disponibles
const THEMES = [
  {
    id: 'blue',
    name: 'Océan',
    description: 'Thème par défaut, professionnel et moderne',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#1d4ed8'],
    icon: 'water-outline',
  },
  {
    id: 'green',
    name: 'Nature',
    description: 'Frais et reposant pour les yeux',
    color: '#22c55e',
    gradient: ['#22c55e', '#16a34a'],
    icon: 'leaf-outline',
  },
  {
    id: 'purple',
    name: 'Royal',
    description: 'Élégant et créatif',
    color: '#a855f7',
    gradient: ['#a855f7', '#7e22ce'],
    icon: 'diamond-outline',
  },
  {
    id: 'orange',
    name: 'Soleil',
    description: 'Énergique et chaleureux',
    color: '#f97316',
    gradient: ['#f97316', '#ea580c'],
    icon: 'sunny-outline',
  },
  {
    id: 'red',
    name: 'Passion',
    description: 'Dynamique et audacieux',
    color: '#ef4444',
    gradient: ['#ef4444', '#dc2626'],
    icon: 'flame-outline',
  },
  {
    id: 'dark',
    name: 'Nuit',
    description: 'Repose les yeux en mode sombre',
    color: '#71717a',
    gradient: ['#27272a', '#18181b'],
    icon: 'moon-outline',
  },
];

export default function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('blue'); // Thème actuel
  const [isSaving, setIsSaving] = useState(false);

  // Charger le thème sauvegardé au démarrage
  React.useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved) {
        setSelectedTheme(saved);
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleSaveTheme = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('app_theme', selectedTheme);
      
      Alert.alert(
        '✅ Thème enregistré',
        'Le thème sera appliqué au prochain redémarrage de l\'application.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de sauvegarder le thème');
      console.error('Erreur sauvegarde thème:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentTheme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary[500]} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.color }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir un thème</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section info */}
        <View style={styles.infoSection}>
          <Ionicons name="color-palette" size={32} color={currentTheme.color} />
          <Text style={styles.infoTitle}>Personnalisez votre expérience</Text>
          <Text style={styles.infoSubtitle}>
            Choisissez le thème qui correspond à votre style
          </Text>
        </View>

        {/* Aperçu du thème sélectionné */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Aperçu en temps réel</Text>
          <View style={[styles.previewCard, { borderColor: currentTheme.color }]}>
            <View style={[styles.previewHeader, { backgroundColor: currentTheme.color }]}>
              <Text style={styles.previewHeaderText}>En-tête</Text>
            </View>
            <View style={styles.previewBody}>
              <View style={[styles.previewButton, { backgroundColor: currentTheme.color }]}>
                <Text style={styles.previewButtonText}>Bouton principal</Text>
              </View>
              <View style={[styles.previewButton, { backgroundColor: currentTheme.color + '20', borderWidth: 1, borderColor: currentTheme.color }]}>
                <Text style={[styles.previewButtonText, { color: currentTheme.color }]}>
                  Bouton secondaire
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grille des thèmes */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Thèmes disponibles ({THEMES.length})</Text>
          
          <View style={styles.themesGrid}>
            {THEMES.map((themeOption) => {
              const isSelected = selectedTheme === themeOption.id;
              
              return (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                    isSelected && { 
                      borderColor: themeOption.color,
                      shadowColor: themeOption.color,
                    }
                  ]}
                  onPress={() => handleThemeSelect(themeOption.id)}
                  activeOpacity={0.7}
                >
                  {/* Badge sélectionné */}
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: themeOption.color }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.selectedBadgeText}>Actif</Text>
                    </View>
                  )}

                  {/* Icône du thème */}
                  <View style={[styles.themeIconContainer, { backgroundColor: themeOption.color }]}>
                    <Ionicons name={themeOption.icon as any} size={32} color="#fff" />
                  </View>

                  {/* Nom du thème */}
                  <Text style={[
                    styles.themeName,
                    isSelected && { color: themeOption.color }
                  ]}>
                    {themeOption.name}
                  </Text>

                  {/* Description */}
                  <Text style={styles.themeDescription} numberOfLines={2}>
                    {themeOption.description}
                  </Text>

                  {/* Mini aperçu de couleurs */}
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, { backgroundColor: themeOption.gradient[0] }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeOption.gradient[1] }]} />
                    <View style={[styles.colorDot, { backgroundColor: themeOption.color }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Informations supplémentaires */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.semantic.info} />
          <Text style={styles.infoBoxText}>
            Le changement de thème prendra effet au prochain redémarrage de l'application.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton de sauvegarde fixe */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: currentTheme.color },
            isSaving && styles.saveButtonDisabled
          ]}
          onPress={handleSaveTheme}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <Text style={styles.saveButtonText}>Enregistrement...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Enregistrer le thème</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },

  // Info Section
  infoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Preview Section
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    ...theme.shadows.sm,
  },
  previewHeader: {
    padding: 16,
    alignItems: 'center',
  },
  previewHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewBody: {
    padding: 16,
    gap: 12,
  },
  previewButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Themes Grid
  themesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    position: 'relative',
  },
  themeCardSelected: {
    borderWidth: 3,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  themeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  themeDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.info + '15',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    ...theme.shadows.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});