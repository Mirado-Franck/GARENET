// app/(client)/home.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { cooperativeService, Cooperative } from '../../services/cooperativeService';
import { voyageService, Voyage } from '../../services/voyageService';
import { avisService } from '../../services/avisService';
import { theme } from '../../constants/theme';

export default function Home() {
  const router = useRouter();
  const { utilisateur } = useAuth();

  // États
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastAvis, setLastAvis] = useState<any[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // ✨ Recherche automatique de voyages
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setIsSearchMode(false);
      setVoyages([]);
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les coopératives
      const coopData = await cooperativeService.getAllCooperatives();
      setCooperatives(coopData);

      // Charger les derniers avis
      try {
        const avisData = await avisService.getLatestAvis(3);
        setLastAvis(avisData.avis || []);
      } catch (error) {
        console.log('Erreur chargement avis (non bloquant)');
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || query.trim() === '') {
      setIsSearchMode(false);
      setVoyages([]);
      return;
    }

    try {
      setSearching(true);
      setIsSearchMode(true);

      const results = await voyageService.searchVoyages(query);
      setVoyages(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setVoyages([]);
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    setIsSearchMode(false);
    loadData();
  };

  const handleCooperativePress = (cooperativeId: number) => {
    router.push(`/(client)/voyages/detailCooperative?id=${cooperativeId}`);
  };

  const handleVoyagePress = (voyageId: number) => {
    router.push(`/(client)/voyages/detailVoyage?id=${voyageId}`);
  };

  const handleVoirTout = () => {
    router.push('/(client)/voyages/listeCooperative');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {utilisateur?.prenoms || utilisateur?.nom || 'Voyageur'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(client)/notification')}
          >
            <Ionicons name="notifications-outline" size={28} color={theme.colors.text.inverse} />
            {/* Badge notification */}
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un voyage (ville départ/arrivée)..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {/* MODE RECHERCHE - RÉSULTATS VOYAGES */}
            {isSearchMode ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {searching ? 'Recherche en cours...' : `Résultats (${voyages.length})`}
                </Text>
                {searching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                  </View>
                ) : voyages.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={60} color={theme.colors.neutral[300]} />
                    <Text style={styles.emptyText}>Aucun voyage trouvé</Text>
                    <Text style={styles.emptySubtext}>
                      Essayez un autre terme de recherche
                    </Text>
                  </View>
                ) : (
                  <View style={styles.voyagesGrid}>
                    {voyages.map((voyage) => (
                      <TouchableOpacity
                        key={voyage.id}
                        style={styles.voyageCard}
                        onPress={() => handleVoyagePress(voyage.id)}
                      >
                        <View style={styles.voyageImagePlaceholder}>
                          <Ionicons name="bus" size={32} color={theme.colors.primary[500]} />
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
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* MODE NORMAL - CONTENU ACCUEIL */}

                {/* Section Slogan stylisé */}
                <View style={styles.sloganSection}>
                  <View style={styles.sloganCard}>
                    <View style={styles.sloganIconContainer}>
                      <Ionicons name="bus" size={50} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={styles.sloganTitle}>Avec GARENET</Text>
                    <Text style={styles.sloganText}>
                      Vos réservations{' '}
                      <Text style={styles.sloganHighlight}>simplifiées</Text>
                      {'\n'}
                      Vos avis{' '}
                      <Text style={styles.sloganHighlight}>retenus</Text>
                    </Text>
                    <View style={styles.sloganDivider} />
                    <Text style={styles.sloganSubtext}>
                      Voyagez en toute confiance avec nos coopératives partenaires
                    </Text>
                  </View>
                </View>

                {/* Section Coopératives populaires */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Coopératives populaires</Text>
                    <TouchableOpacity onPress={handleVoirTout}>
                      <Text style={styles.voirToutText}>Voir tout</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {cooperatives.slice(0, 5).map((coop) => (
                      <TouchableOpacity
                        key={coop.id}
                        style={styles.cooperativeCardHorizontal}
                        onPress={() => handleCooperativePress(coop.id)}
                      >
                        <View style={styles.cooperativeImageContainerHorizontal}>
                          {coop.logo ? (
                            <Image source={{ uri: coop.logo }} style={styles.cooperativeImageHorizontal} />
                          ) : (
                            <View style={styles.cooperativeImagePlaceholderHorizontal}>
                              <Ionicons name="bus" size={40} color={theme.colors.primary[500]} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.cooperativeNameHorizontal} numberOfLines={2}>
                          {coop.nom}
                        </Text>
                        <View style={styles.cooperativeMetaHorizontal}>
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  coop.statut === 'actif'
                                    ? theme.colors.semantic.success
                                    : theme.colors.neutral[400],
                              },
                            ]}
                          />
                          <Text style={styles.statusTextSmall}>{coop.statut}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Section Derniers avis */}
                {lastAvis.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Derniers avis</Text>
                    <View style={styles.avisList}>
                      {lastAvis.map((avis, index) => (
                        <View key={index} style={styles.avisCard}>
                          <View style={styles.avisHeader}>
                            <View style={styles.avisUserInfo}>
                              <View style={styles.avisAvatar}>
                                <Ionicons name="person" size={20} color={theme.colors.primary[500]} />
                              </View>
                              <View>
                                <Text style={styles.avisUserName}>{avis.client.nom_complet}</Text>
                                <View style={styles.avisStars}>
                                  {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                      key={i}
                                      name={i < avis.note ? 'star' : 'star-outline'}
                                      size={14}
                                      color="#FFB800"
                                    />
                                  ))}
                                </View>
                              </View>
                            </View>
                          </View>
                          {avis.commentaire && (
                            <Text style={styles.avisComment} numberOfLines={2}>
                              {avis.commentaire}
                            </Text>
                          )}
                          <Text style={styles.avisTrajet}>{avis.voyage.trajet}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 50,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.light,
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  notificationBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  voirToutText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.semibold,
  },
  // ✨ NOUVEAU : Section Slogan
  sloganSection: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  sloganCard: {
    backgroundColor: theme.colors.primary[500],
    padding: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  sloganIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sloganTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  sloganText: {
    fontSize: theme.typography.sizes.h3,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: theme.spacing.lg,
  },
  sloganHighlight: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary[300],
    textDecorationLine: 'underline',
  },
  sloganDivider: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.secondary[300],
    borderRadius: 2,
    marginVertical: theme.spacing.md,
  },
  sloganSubtext: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.light,
    textAlign: 'center',
    opacity: 0.9,
  },
  // FIN Section Slogan
  horizontalScroll: {
    paddingRight: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  cooperativeCardHorizontal: {
    width: 150,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cooperativeImageContainerHorizontal: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  cooperativeImageHorizontal: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cooperativeImagePlaceholderHorizontal: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooperativeNameHorizontal: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    minHeight: 32,
  },
  cooperativeMetaHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTextSmall: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  // Styles pour les résultats de recherche (voyages)
  voyagesGrid: {
    gap: theme.spacing.md,
  },
  voyageCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  voyageImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  voyageInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  voyageTitre: {
    fontSize: theme.typography.sizes.body,
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
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  voyageCooperative: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.secondary[500],
    fontWeight: theme.typography.weights.semibold,
  },
  avisList: {
    gap: theme.spacing.md,
  },
  avisCard: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  avisHeader: {
    marginBottom: theme.spacing.sm,
  },
  avisUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avisAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisUserName: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  avisStars: {
    flexDirection: 'row',
    gap: 2,
  },
  avisComment: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  avisTrajet: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.medium,
  },
});