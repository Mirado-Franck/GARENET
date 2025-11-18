// app/(client)/voyages/voyagePropose.tsx
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
  Animated,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { voyageService, VoyageFilterParams } from '../../../services/voyageService';
import { theme } from '../../../constants/theme';
import DatePicker from '../../../components/ui/DatePicker';
import Select, { SelectOption } from '../../../components/ui/Select';

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

// ✨ Options pour le select de status
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'tous', label: 'Tous les voyages' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'termine', label: 'Terminé' },
];

export default function VoyagePropose() {
  const params = useLocalSearchParams();
  const cooperativeId = parseInt(params.cooperativeId as string);

  // États
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cooperativeName, setCooperativeName] = useState('');

  // ✨ États des filtres
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('disponible'); // Par défaut: disponible
  const [showFilters, setShowFilters] = useState(false);
  const [filterAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadVoyages();
  }, []);

  const loadVoyages = async () => {
    try {
      setLoading(true);
      
      // Par défaut, charger les voyages disponibles
      const filters: VoyageFilterParams = {
        status: 'disponible',
      };

      const data = await voyageService.filterVoyagesByCooperative(cooperativeId, filters);

      setVoyages(data);
      if (data.length > 0) {
        setCooperativeName(data[0].cooperative.nom);
      }
    } catch (error) {
      console.error('Erreur chargement voyages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✨ Appliquer les filtres
  const applyFilters = async () => {
    try {
      setLoading(true);

      const filters: VoyageFilterParams = {
        status: selectedStatus as any,
      };

      // Ajouter la date si sélectionnée
      if (selectedDate) {
        filters.date = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }

      console.log('🔍 Application des filtres:', filters);

      const data = await voyageService.filterVoyagesByCooperative(cooperativeId, filters);
      setVoyages(data);

      // Fermer la section filtres après application
      toggleFilters();
    } catch (error) {
      console.error('Erreur application filtres:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Réinitialiser les filtres
  const resetFilters = async () => {
    setSelectedDate(null);
    setSelectedStatus('disponible');

    try {
      setLoading(true);

      const filters: VoyageFilterParams = {
        status: 'disponible',
      };

      const data = await voyageService.filterVoyagesByCooperative(cooperativeId, filters);
      setVoyages(data);
      
      toggleFilters();
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Toggle section filtres avec animation
  const toggleFilters = () => {
    const toValue = showFilters ? 0 : 1;
    Animated.timing(filterAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowFilters(!showFilters);
  };

  const filterHeight = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Hauteur de la section filtres
  });

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
      termine: { color: theme.colors.neutral[500], label: 'Terminé', icon: 'checkmark-done-circle' },
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

  if (loading && !refreshing) {
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
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor={theme.colors.primary[500]} barStyle="light-content" />

      {/* Header */}
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
        {/* ✨ Bouton filtres */}
        <TouchableOpacity style={styles.filterToggleButton} onPress={toggleFilters}>
          <Ionicons name="filter" size={20} color={theme.colors.primary[500]} />
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Text>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>

        {/* ✨ Section filtres animée */}
        <Animated.View style={[styles.filtersSection, { height: filterHeight, overflow: 'hidden' }]}>
          {showFilters && (
            <View style={styles.filtersContent}>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                label="Date de départ"
                placeholder="Sélectionner une date"
                minimumDate={new Date()}
              />

              <Select
                options={STATUS_OPTIONS}
                value={selectedStatus}
                onChange={setSelectedStatus}
                label="Status du voyage"
              />

              <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.applyButtonText}>Appliquer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Ionicons name="refresh" size={20} color={theme.colors.neutral[600]} />
                  <Text style={styles.resetButtonText}>Réinitialiser</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Compteur */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {voyages.length} {voyages.length > 1 ? 'voyages' : 'voyage'} trouvé{voyages.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Liste des voyages */}
        {voyages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={80} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Aucun voyage trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Aucun voyage ne correspond aux critères sélectionnés.
            </Text>
            <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
              <Text style={styles.resetFiltersButtonText}>Réinitialiser les filtres</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={voyages}
            renderItem={renderVoyageCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
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
  // ✨ Styles filtres
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  filterToggleText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[500],
  },
  filtersSection: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  filtersContent: {
    padding: theme.spacing.lg,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  applyButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  resetButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.neutral[600],
  },
  // FIN Styles filtres
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
    marginBottom: theme.spacing.lg,
  },
  resetFiltersButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  resetFiltersButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});