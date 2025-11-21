import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cooperativeService, Cooperative } from '../../../services/cooperativeService';
import { theme } from '../../../constants/theme';
import { UPLOADS_URL } from '../../../services/api'; // ✅ IMPORT AJOUTÉ

export default function ListeCooperative() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filteredCooperatives, setFilteredCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCooperatives();
  }, []);

  useEffect(() => {
    filterCooperatives();
  }, [searchQuery, cooperatives]);

  const loadCooperatives = async () => {
    try {
      setLoading(true);
      const data = await cooperativeService.getAllCooperatives();
      setCooperatives(data);
      setFilteredCooperatives(data);
    } catch (error) {
      console.error('Erreur chargement coopératives:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCooperatives = () => {
    if (!searchQuery.trim()) {
      setFilteredCooperatives(cooperatives);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cooperatives.filter(
      (coop) =>
        coop.nom.toLowerCase().includes(query) ||
        coop.adresse.toLowerCase().includes(query) ||
        coop.code_cooperative.toLowerCase().includes(query)
    );
    setFilteredCooperatives(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCooperatives();
  };

  const handleViewDetails = (cooperativeId: number) => {
    router.push(`/(client)/voyages/detailCooperative?id=${cooperativeId}`);
  };

  const handleViewVoyages = (cooperativeId: number) => {
    router.push(`/(client)/voyages/voyagePropose?cooperativeId=${cooperativeId}`);
  };

  const renderCooperativeCard = ({ item }: { item: Cooperative }) => (
    <View style={styles.card}>
      {/* Header avec logo */}
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          {/* ✅ AFFICHAGE LOGO CORRIGÉ */}
          {item.logo ? (
            <Image 
              source={{ uri: `${UPLOADS_URL}/${item.logo}` }} 
              style={styles.logo} 
              resizeMode="contain" // Pour ne pas couper le logo
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>🚌</Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.cooperativeName} numberOfLines={2}>
            {item.nom}
          </Text>
          <Text style={styles.codeCooperative}>{item.code_cooperative}</Text>
          {item.note_moyenne && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{item.note_moyenne.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Informations */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={theme.colors.primary[500]} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.adresse}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={theme.colors.primary[500]} />
          <Text style={styles.infoText}>{item.contact}</Text>
        </View>
        {item.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.primary[500]} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        )}
      </View>

      {/* Badge statut */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.statut === 'actif'
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
                  item.statut === 'actif'
                    ? theme.colors.semantic.success
                    : theme.colors.text.secondary,
              },
            ]}
          >
            {item.statut === 'actif' ? '✓ Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item.id)}
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary[500]} />
          <Text style={styles.detailsButtonText}>Voir détails</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.voyagesButton}
          onPress={() => handleViewVoyages(item.id)}
        >
          <Ionicons name="bus-outline" size={18} color="#fff" />
          <Text style={styles.voyagesButtonText}>Voir ses voyages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des coopératives...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Coopératives de Transport</Text>
        <Text style={styles.subtitle}>
          {filteredCooperatives.length} {filteredCooperatives.length > 1 ? 'coopératives' : 'coopérative'}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une coopérative..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.neutral[400]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des coopératives */}
      {filteredCooperatives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={80} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Aucune coopérative trouvée</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Essayez avec un autre terme de recherche'
              : 'Aucune coopérative disponible pour le moment'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCooperatives}
          renderItem={renderCooperativeCard}
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
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    marginRight: theme.spacing.md,
    // ✅ Fond blanc et bordure pour le logo
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    // ✅ Mode contain pour voir tout le logo
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cooperativeName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  codeCooperative: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  infoContainer: {
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  statusContainer: {
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  detailsButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary[500],
  },
  voyagesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.sm,
  },
  voyagesButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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