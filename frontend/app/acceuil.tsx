// app/acceuil.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { voyageService, Voyage } from '../services/voyageService';

export default function Acceuil() {
  const { theme } = useTheme(); // 👈 Hook dynamique
  const router = useRouter();
  const { isConnecte, setRedirectAfterLogin } = useAuth();
  
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [villeActuelle] = useState('Fianarantsoa');
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    loadVoyages();
  }, []);

const loadVoyages = async () => {
  try {
    setError(null);
    setIsSearchMode(false);
    const data = await voyageService.getAllVoyages();
    
    // Filtrer : ville actuelle + statut disponible
    const voyagesRecommandes = data.filter(v => 
      v.trajet.station_depart.toLowerCase() === villeActuelle.toLowerCase() &&
      v.status === 'disponible'
    );
    
    setVoyages(voyagesRecommandes);
  } catch (err) {
    setError('Impossible de charger les voyages');
    console.error(err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleSearch = async (query: string) => {
    if (!query || query.trim() === '') {
      loadVoyages();
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setIsSearchMode(true);
      
      const results = await voyageService.searchVoyages(query);
      setVoyages(results);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    loadVoyages();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVoyages();
  };

  const handleSeConnecter = () => {
    setRedirectAfterLogin(null);
    router.push('/se-connecter');
  };

  const handleSInscrire = () => {
    router.push('/inscription');
  };
  
  const handleVoyagePress = (voyageId: number) => {
    setRedirectAfterLogin(`/(client)/voyages/detailVoyage?id=${voyageId}`);
    router.push('/se-connecter');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHeure = (heureString: string | null) => {
    if (!heureString) return 'N/A';
    const date = new Date(heureString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Styles dynamiques
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxxl,
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.primary[500],
      borderBottomLeftRadius: theme.borderRadius.xl,
      borderBottomRightRadius: theme.borderRadius.xl,
    },
    logo: {
      fontSize: 28,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.light,
      textAlign: 'center',
    },
    section: {
      padding: theme.spacing.xl,
      marginTop: 0,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
      marginBottom: theme.spacing.lg,
    },
    localisationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },
    localisationIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    localisationText: {
      flex: 1,
    },
    villeActuelle: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
      marginBottom: theme.spacing.xs,
    },
    localisationSubtitle: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
    },
    searchSection: {
      paddingHorizontal: theme.spacing.xl,
      marginBottom: 0,
      paddingTop: 0,
    },
    searchBar: {
      marginVertical: 0,
    },
    voyagesSection: {
      flex: 1,
      padding: theme.spacing.xl,
      marginTop: 0,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.secondary,
    },
    errorContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    errorText: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.semantic.error,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      backgroundColor: theme.colors.primary[500],
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
    },
    retryText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    voyagesContainer: {
      gap: theme.spacing.md,
    },
    voyageCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      marginBottom: theme.spacing.sm,
    },
    voyageImagePlaceholder: {
      width: 50,
      height: 50,
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    placeholderText: {
      fontSize: 20,
    },
    voyageInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    voyageTitre: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    voyageDetails: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    voyagePrix: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
      marginBottom: theme.spacing.xs,
    },
    voyageCooperative: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.secondary[500],
      fontWeight: theme.typography.weights.semibold,
      marginBottom: 2,
    },
    voyageCapacite: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.tertiary,
    },
    actionsSection: {
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
      marginTop: 0,
      paddingTop: theme.spacing.md,
    },
    actionButton: {
      marginHorizontal: 0,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral[300],
      marginTop: 0,
    },
    footerText: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={28} color="#fff" />
        <Text style={styles.logo}>GarNET</Text>
        <Text style={styles.title}>Bienvenue sur GarNET</Text>
        <Text style={styles.subtitle}>
          Réservez vos voyages en toute simplicité
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Votre localisation</Text>
        <View style={styles.localisationCard}>
          <Ionicons name="location" size={24} color={theme.colors.primary[500]} style={{ marginRight: theme.spacing.md }} />
          <View style={styles.localisationText}>
            <Text style={styles.villeActuelle}>{villeActuelle}</Text>
            <Text style={styles.localisationSubtitle}>
              Ville détectée automatiquement
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Rechercher par ville (départ ou arrivée)..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.voyagesSection}>
        <Text style={styles.sectionTitle}>
          {isSearchMode 
            ? 'Résultats de recherche' 
            : `Voyages recommandés depuis ${villeActuelle}`
          }
        </Text>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary[500]]}
            />
          }
          showsVerticalScrollIndicator={true}
        >
          {(loading || searching) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
              <Text style={styles.loadingText}>
                {searching ? 'Recherche en cours...' : 'Chargement des voyages...'}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadVoyages}>
                <Text style={styles.retryText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : voyages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bus-outline" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.emptyText}>
                {isSearchMode 
                  ? 'Aucun voyage trouvé pour cette recherche'
                  : `Aucun voyage disponible depuis ${villeActuelle}`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.voyagesContainer}>
              {voyages.map((voyage) => (
                <TouchableOpacity 
                  key={voyage.id}
                  style={styles.voyageCard}
                  onPress={() => handleVoyagePress(voyage.id)}
                >
                  <View style={styles.voyageImagePlaceholder}>
                    <Ionicons name="bus" size={24} color={theme.colors.primary[500]} />
                  </View>
                  <View style={styles.voyageInfo}>
                    <Text style={styles.voyageTitre}>
                      {voyage.trajet.station_depart} → {voyage.trajet.station_arrivee}
                    </Text>
                    <Text style={styles.voyageDetails}>
                      {formatDate(voyage.date_depart)} • {formatHeure(voyage.heure_depart)}
                    </Text>
                    <Text style={styles.voyagePrix}>{voyage.prix.toLocaleString()} Ar</Text>
                    <Text style={styles.voyageCooperative}>
                      {voyage.cooperative.nom}
                    </Text>
                    <Text style={styles.voyageCapacite}>
                      {voyage.voiture.capacite} places • {voyage.voiture.modele}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.actionsSection}>
        <Button
          title="Se connecter"
          onPress={handleSeConnecter}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="S'inscrire"
          onPress={handleSInscrire}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Explorez le monde avec nous</Text>
      </View>
    </SafeAreaView>
  );
}