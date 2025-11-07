import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cooperativeService, CooperativeDetail } from '../../../services/cooperativeService';
import { theme } from '../../../constants/theme';

export default function DetailCooperative() {
  const params = useLocalSearchParams();
  const cooperativeId = parseInt(params.id as string);

  const [cooperative, setCooperative] = useState<CooperativeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCooperative();
  }, []);

  const loadCooperative = async () => {
    try {
      setLoading(true);
      const data = await cooperativeService.getCooperativeById(cooperativeId);
      setCooperative(data);
    } catch (error) {
      console.error('Erreur chargement coopérative:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCooperative();
  };

  const handleViewVoyages = () => {
    router.push(`/(client)/voyages/voyagePropose?cooperativeId=${cooperativeId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!cooperative) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>Coopérative introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Coopérative</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {/* Carte principale */}
        <View style={styles.mainCard}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            {cooperative.logo ? (
              <Image source={{ uri: cooperative.logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>🚌</Text>
              </View>
            )}
          </View>

          {/* Nom et code */}
          <Text style={styles.cooperativeName}>{cooperative.nom}</Text>
          <Text style={styles.codeCooperative}>{cooperative.code_cooperative}</Text>

          {/* Note moyenne */}
          {cooperative.note_moyenne && (
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(cooperative.note_moyenne!) ? 'star' : 'star-outline'}
                  size={24}
                  color="#FFB800"
                />
              ))}
              <Text style={styles.ratingValue}>{cooperative.note_moyenne.toFixed(1)}</Text>
            </View>
          )}

          {/* Statut */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  cooperative.statut === 'actif'
                    ? theme.colors.semantic.success + '20'
                    : theme.colors.neutral[200],
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    cooperative.statut === 'actif'
                      ? theme.colors.semantic.success
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {cooperative.statut === 'actif' ? '✓ Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Informations de contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={theme.colors.primary[500]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{cooperative.adresse}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{cooperative.contact}</Text>
            </View>
          </View>

          {cooperative.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={theme.colors.primary[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{cooperative.email}</Text>
              </View>
            </View>
          )}

          {cooperative.date_inscription && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date d'inscription</Text>
                <Text style={styles.infoValue}>{formatDate(cooperative.date_inscription)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stations */}
        {cooperative.stations && cooperative.stations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stations ({cooperative.stations.length})</Text>
            {cooperative.stations.map((station: any, index: number) => (
              <View key={index} style={styles.itemCard}>
                <Ionicons name="business-outline" size={24} color={theme.colors.primary[500]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{station.nom}</Text>
                  {station.localisation && (
                    <Text style={styles.itemDetail}>📍 {station.localisation}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Voitures */}
        {cooperative.voitures && cooperative.voitures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Véhicules ({cooperative.voitures.length})</Text>
            {cooperative.voitures.map((voiture: any, index: number) => (
              <View key={index} style={styles.itemCard}>
                <Ionicons name="car-outline" size={24} color={theme.colors.primary[500]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{voiture.modele}</Text>
                  <Text style={styles.itemDetail}>
                    {voiture.immatriculation} • {voiture.capacite} places
                  </Text>
                  <View
                    style={[
                      styles.miniStatusBadge,
                      {
                        backgroundColor:
                          voiture.disponibilite === 'disponible'
                            ? theme.colors.semantic.success + '20'
                            : theme.colors.neutral[200],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniStatusText,
                        {
                          color:
                            voiture.disponibilite === 'disponible'
                              ? theme.colors.semantic.success
                              : theme.colors.text.secondary,
                        },
                      ]}
                    >
                      {voiture.disponibilite}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Prochains voyages */}
        {cooperative.prochains_voyages && cooperative.prochains_voyages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prochains voyages ({cooperative.prochains_voyages.length})</Text>
            {cooperative.prochains_voyages.slice(0, 3).map((voyage: any, index: number) => (
              <View key={index} style={styles.itemCard}>
                <Ionicons name="navigate-outline" size={24} color={theme.colors.primary[500]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {voyage.trajet?.station_depart} → {voyage.trajet?.station_arrivee}
                  </Text>
                  <Text style={styles.itemDetail}>
                    📅 {formatDate(voyage.date_depart)} • {voyage.prix?.toLocaleString()} Ar
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Espace pour éviter que le contenu soit caché par le bouton */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton fixe en bas */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.voyagesButton} onPress={handleViewVoyages}>
          <Ionicons name="bus" size={20} color="#fff" />
          <Text style={styles.voyagesButtonText}>Voir tous les voyages</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: theme.typography.sizes.h3,
    color: theme.colors.semantic.error,
    marginVertical: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 60,
  },
  cooperativeName: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  codeCooperative: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  ratingValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  section: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  itemCard: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  miniStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
  },
  miniStatusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  voyagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  voyagesButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});