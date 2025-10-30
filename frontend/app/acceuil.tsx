// app/acceuil.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { voyageService, Voyage } from '../services/voyageService';

export default function Acceuil() {
  const router = useRouter();
  
  // États
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
      
      // Filtrer les voyages recommandés depuis la ville actuelle
      const voyagesRecommandes = data.filter(v => 
        v.trajet.station_depart.toLowerCase() === villeActuelle.toLowerCase()
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
    router.push('/se-connecter');
  };

  const handleSInscrire = () => {
    router.push('/inscription');
  };

  const handleVoyagePress = (voyageId: number) => {
    router.push(`/(client)/voyages/detailVoyage?id=${voyageId}`);
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

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Section En-tête */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌱 GARENET</Text>
        <Text style={styles.title}>Bienvenue sur Garenet</Text>
        <Text style={styles.subtitle}>
          Réservez vos voyages en toute simplicité
        </Text>
      </View>

      {/* Section Localisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Votre localisation</Text>
        <View style={styles.localisationCard}>
          <Text style={styles.localisationIcon}>📍</Text>
          <View style={styles.localisationText}>
            <Text style={styles.villeActuelle}>{villeActuelle}</Text>
            <Text style={styles.localisationSubtitle}>
              Ville détectée automatiquement
            </Text>
          </View>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Rechercher par ville (départ ou arrivée)..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Section Voyages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isSearchMode 
            ? 'Résultats de recherche' 
            : `Voyages recommandés depuis ${villeActuelle}`
          }
        </Text>
        
        {(loading || searching) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>
              {searching ? 'Recherche en cours...' : 'Chargement des voyages...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadVoyages}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : voyages.length === 0 ? (
          <View style={styles.emptyContainer}>
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
                  <Text style={styles.placeholderText}>🚌</Text>
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
      </View>

      {/* Section Boutons d'action */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Explorez le monde avec nous</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  localisationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  localisationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  localisationText: {
    flex: 1,
  },
  villeActuelle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  localisationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    marginVertical: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  voyagesContainer: {
    gap: 15,
  },
  voyageCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  voyageImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  placeholderText: {
    fontSize: 24,
  },
  voyageInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  voyageTitre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  voyageDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  voyagePrix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  voyageCooperative: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 2,
  },
  voyageCapacite: {
    fontSize: 11,
    color: '#999',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    marginHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});