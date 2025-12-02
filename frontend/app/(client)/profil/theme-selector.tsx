import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeConfig, ThemeKey } from '../../../constants/themes';

// Définition des thèmes disponibles (id = clés de ThemeKey)
const THEMES: { id: ThemeKey; name: string; description: string; icon: string }[] = [
  {
    id: 'blue',
    name: 'Océan',
    description: 'Professionnel et moderne',
    icon: 'water-outline',
  },
  {
    id: 'green',
    name: 'Nature',
    description: 'Frais et reposant',
    icon: 'leaf-outline',
  },
  {
    id: 'purple',
    name: 'Royal',
    description: 'Élégant et créatif',
    icon: 'diamond-outline',
  },
  {
    id: 'orange', // 🟤 chocolat
    name: 'Chocolat',
    description: 'Chaud et gourmand',
    icon: 'cafe-outline',
  },
  {
    id: 'red',
    name: 'Passion',
    description: 'Dynamique et audacieux',
    icon: 'flame-outline',
  },
  {
    id: 'dark', // 🟡 jaune
    name: 'Jaune',
    description: 'Lumineux et optimiste',
    icon: 'sunny-outline',
  },
];

// Composant Toast
const Toast = ({
  visible,
  message,
  type = 'success',
}: {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          backgroundColor: type === 'success' ? '#22c55e' : '#ef4444',
        },
      ]}
    >
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color="#fff"
      />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function ThemeSelector() {
  const { theme, currentThemeKey, setTheme, isLoading } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentThemeKey);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mettre à jour la sélection quand le thème change
  React.useEffect(() => {
    setSelectedTheme(currentThemeKey);
  }, [currentThemeKey]);

  const handleThemeSelect = async (themeId: ThemeKey) => {
    try {
      setSelectedTheme(themeId);
      setIsSaving(true);

      // Appliquer le thème instantanément
      await setTheme(themeId);

      // Afficher le toast de confirmation
      setToastMessage('✨ Thème appliqué avec succès !');
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (error) {
      console.error('Erreur changement thème:', error);
      setToastMessage("❌ Erreur lors de l'application du thème");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        {/* 🔒 Masquer le header Expo pour éviter la barre blanche "theme-selector" */}
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  // Couleur du thème ACTUEL (pour le header, l'aperçu global)
  const currentColor = theme.colors.primary[500];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
    >
      {/* 🔒 Masquer le header par défaut */}
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle="light-content"
        backgroundColor={currentColor}
        translucent
      />

      {/* Header avec effet wave */}
      <View style={[styles.header, { backgroundColor: currentColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons
            name="color-palette"
            size={28}
            color="#fff"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.headerTitle}>Personnalisation</Text>
          <Text style={styles.headerSubtitle}>
            Choisissez votre thème préféré
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Aperçu en temps réel (du thème ACTUEL) */}
        <View style={styles.previewSection}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Aperçu instantané
          </Text>
          <View
            style={[
              styles.previewCard,
              {
                borderColor: currentColor,
                backgroundColor: theme.colors.background.primary,
              },
            ]}
          >
            <View
              style={[styles.previewHeader, { backgroundColor: currentColor }]}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.previewHeaderText}>En-tête</Text>
            </View>
            <View style={styles.previewBody}>
              <View
                style={[styles.previewButton, { backgroundColor: currentColor }]}
              >
                <Text style={styles.previewButtonText}>Bouton principal</Text>
              </View>
              <View
                style={[
                  styles.previewButton,
                  {
                    backgroundColor: currentColor + '20',
                    borderWidth: 1,
                    borderColor: currentColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewButtonText,
                    { color: currentColor },
                  ]}
                >
                  Bouton secondaire
                </Text>
              </View>
              <View style={styles.previewTextSection}>
                <View
                  style={[styles.previewDot, { backgroundColor: currentColor }]}
                />
                <Text
                  style={[
                    styles.previewText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Texte d'exemple avec le nouveau thème
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grille des thèmes */}
        <View style={styles.themesSection}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Thèmes disponibles ({THEMES.length})
          </Text>

          <View style={styles.themesGrid}>
            {THEMES.map((themeOption) => {
              const isSelected = selectedTheme === themeOption.id;
              const isCurrentActive = currentThemeKey === themeOption.id;

              // 🎨 Palette propre à CHAQUE thème (indépendante du thème actuel de l'app)
              const optionTheme = getThemeConfig(themeOption.id);
              const optionColor = optionTheme.colors.primary[500];

              return (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: theme.colors.background.primary,
                      borderColor: isSelected
                        ? optionColor
                        : theme.colors.neutral[200],
                    },
                    isSelected && styles.themeCardSelected,
                    isSelected && {
                      shadowColor: optionColor,
                      borderWidth: 3,
                    },
                  ]}
                  onPress={() => handleThemeSelect(themeOption.id)}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  {/* Badge actif */}
                  {isCurrentActive && (
                    <View
                      style={[
                        styles.activeBadge,
                        { backgroundColor: optionColor },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#fff"
                      />
                      <Text style={styles.activeBadgeText}>Actif</Text>
                    </View>
                  )}

                  {/* Icône du thème – fond = couleur du thème, pas celle de l'app */}
                  <View
                    style={[
                      styles.themeIconContainer,
                      { backgroundColor: optionColor },
                    ]}
                  >
                    <Ionicons
                      name={themeOption.icon as any}
                      size={32}
                      color="#fff"
                    />
                  </View>

                  {/* Nom du thème – accent avec couleur du thème sélectionné */}
                  <Text
                    style={[
                      styles.themeName,
                      {
                        color: isSelected
                          ? optionColor
                          : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {themeOption.name}
                  </Text>

                  {/* Description */}
                  <Text
                    style={[
                      styles.themeDescription,
                      { color: theme.colors.text.secondary },
                    ]}
                    numberOfLines={2}
                  >
                    {themeOption.description}
                  </Text>

                  {/* Indicateur de chargement */}
                  {isSaving && isSelected && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color={optionColor} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Info box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.colors.semantic.info + '15' },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.semantic.info}
          />
          <Text
            style={[
              styles.infoBoxText,
              { color: theme.colors.text.secondary },
            ]}
          >
            💡 Le changement de thème est instantané et s'applique à toute
            l'application !
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Toast notification */}
      <Toast visible={showToast} message={toastMessage} type="success" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  // Content
  content: {
    flex: 1,
  },

  // Preview Section
  previewSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  previewTextSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewText: {
    fontSize: 13,
    flex: 1,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themeCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  activeBadge: {
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
  activeBadgeText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  themeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});