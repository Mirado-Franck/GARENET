import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { voyageService } from '../../../services/voyageService';
import { theme } from '../../../constants/theme';

interface Voyage {
  id: number;
  code_voyage: string;
  date_depart: string;
  heure_depart: string | null;
  prix: number;
  status: string;
  trajet: {
    station_depart: string;
    station_arrivee: string;
    distance: number;
  };
  voiture: {
    modele: string;
    capacite: number;
  };
  cooperative: {
    nom: string;
  };
}

export default function VoyagePropose() {
  const params = useLocalSearchParams();
  const cooperativeId = parseInt(params.cooperativeId as string);

  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cooperativeName, setCooperativeName] = useState('');

  useEffect(() => {
    loadVoyages();
  }, []);

  const loadVoyages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/voyages/cooperative/${cooperativeId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setVoyages(data);
        if (data.length > 0) {
          setCooperativeName(data[0].cooperative.nom);
        }
      }
    } catch (error) {
      console.error('Erreur chargement voyages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVoyages();
  };

  const handleViewDetails = (voyageId: number) => {
    router.push(`/(client)/voyages/detailVoyage?id=${voyageId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disponible: { color: theme.colors.semantic.success, label: 'Disponible', icon: 'checkmark-circle' },
      complet: { color: theme.colors.semantic.error, label: 'Complet', icon: 'close-circle' },
      annule: { color: theme.colors.neutral[500], label: 'Annulé', icon: 'ban' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: theme.colors.neutral[500],
      label: status,
      icon: 'help-circle',
    };

    return (
       <View style={[styles.statusBadge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
        <Ionicons name={config.icon as any} size={14} color={config.color} />
       <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  const renderVoyageCard = ({ item }: { item: Voyage }) => (
    <View style={styles.card}>
      {/* En-tête */}
      <View style={styles.cardHeader}>
        <Text style={styles.codeVoyage}>{item.code_voyage}</Text>
        {getStatusBadge(item.status)}
      </View>

      {/* Trajet */}
      <View style={styles.trajetContainer}>
        <View style={styles.trajetPoint}>
          <Ionicons name="location" size={20} color={theme.colors.semantic.success} />
          <Text style={styles.trajetText}>{item.trajet.station_depart}</Text>
        </View>
        <View style={styles.trajetLine}>
          <View style={styles.dashedLine} />
          <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          <Text style={styles.distanceText}>{item.trajet.distance} km</Text>
        </View>
        <View style={styles.trajetPoint}>
          <Ionicons name="location" size={20} color={theme.colors.semantic.error} />
          <Text style={styles.trajetText}>{item.trajet.station_arrivee}</Text>
        </View>
      </View>

      {/* Informations */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary[500]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(item.date_depart)}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={18} color={theme.colors.primary[500]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Heure</Text>
            <Text style={styles.infoValue}>{formatHeure(item.heure_depart)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="car-outline" size={18} color={theme.colors.primary[500]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Véhicule</Text>
            <Text style={styles.infoValue}>{item.voiture.modele}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={18} color={theme.colors.primary[500]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Capacité</Text>
            <Text style={styles.infoValue}>{item.voiture.capacite} places</Text>
          </View>
        </View>
      </View>

      {/* Prix et bouton */}
      <View style={styles.footer}>
        <View style={styles.prixContainer}>
          <Text style={styles.prixLabel}>Prix</Text>
          <Text style={styles.prixValue}>{item.prix.toLocaleString()} Ar</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.detailsButton,
            item.status !== 'disponible' && styles.detailsButtonDisabled,
          ]}
          onPress={() => handleViewDetails(item.id)}
        >
          <Text style={styles.detailsButtonText}>Voir détails</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar backgroundColor={theme.colors.primary[500]} barStyle="light-content" />
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des voyages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Configuration pour cacher le header par défaut d'Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <StatusBar backgroundColor={theme.colors.primary[500]} barStyle="light-content" />
      
      {/* Header Bleu Unique */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(client)/voyages/listeCooperative');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Voyages proposés</Text>
          {cooperativeName && <Text style={styles.subtitle}>{cooperativeName}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Compteur */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {voyages.length} {voyages.length > 1 ? 'voyages' : 'voyage'} disponible{voyages.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Liste des voyages */}
        {voyages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={80} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Aucun voyage disponible</Text>
            <Text style={styles.emptySubtitle}>
              Cette coopérative n'a pas de voyages programmés pour le moment.
            </Text>
          </View>
        ) : (
          <FlatList
            data={voyages}
            renderItem={renderVoyageCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary[500]]}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginTop: 4,
  },
  countContainer: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  countText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  codeVoyage: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  trajetContainer: {
    marginBottom: theme.spacing.md,
  },
  trajetPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trajetText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  trajetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingVertical: 4,
    gap: 8,
  },
  dashedLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.neutral[300],
  },
  distanceText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  prixContainer: {
    flex: 1,
  },
  prixLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  prixValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  detailsButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },
  detailsButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});