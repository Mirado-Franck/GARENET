import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { cooperativeService, Cooperative } from '../../services/cooperativeService';
import { voyageService, Voyage } from '../../services/voyageService';
import { avisService } from '../../services/avisService';
import { notificationService } from '../../services/notificationService';
import { theme } from '../../constants/theme';
import { UPLOADS_URL } from '../../services/api';

export default function Home() {
  const router = useRouter();
  const { utilisateur } = useAuth();

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastAvis, setLastAvis] = useState<any[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);

  // ❌ SUPPRIMÉ : useEffect simple qui ne chargeait qu'une fois
  /*
  useEffect(() => {
    loadData();
  }, []);
  */

  // ✅ CORRECTION : useFocusEffect pour TOUT recharger (Notifs + Données) à chaque retour
  useFocusEffect(
    useCallback(() => {
      loadNotificationCount();
      loadData(); // On recharge les avis et coopératives ici !
    }, [])
  );

  const loadNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.log('Erreur chargement compteur notifs');
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setIsSearchMode(false);
      setVoyages([]);
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadData = async () => {
    // On ne met setLoading(true) que si ce n'est pas un refresh manuel pour éviter le clignotement trop fréquent
    // Mais pour le premier chargement, on peut gérer un état local si besoin.
    try {
      // Charger les coopératives
      const coopData = await cooperativeService.getAllCooperatives();
      setCooperatives(coopData);

      // Charger les derniers avis
      try {
        const avisData = await avisService.getLatestAvis(5); // On en charge 5 pour le scroll horizontal
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
    loadNotificationCount();
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
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un voyage..."
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
                {/* Slogan Section */}
                <View style={styles.sloganSection}>
                  <View style={styles.sloganCard}>
                    <View style={styles.sloganIconContainer}>
                      <Ionicons name="bus" size={50} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={styles.sloganTitle}>Avec GarNET</Text>
                    <Text style={styles.sloganText}>
                      Vos réservations{' '}
                      <Text style={styles.sloganHighlight}>simplifiées</Text>
                      {'\n'}
                      Vos avis{' '}
                      <Text style={styles.sloganHighlight}>retenus</Text>
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
                            <Image 
                              source={{ uri: `${UPLOADS_URL}/${coop.logo}` }} 
                              style={styles.cooperativeImageHorizontal} 
                              resizeMode="contain" 
                            />
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

                {/* ✅ SECTION AVIS MODIFIÉE : SCROLL HORIZONTAL */}
                {lastAvis.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Derniers avis</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll} // Réutilisation du style horizontal
                    >
                      {lastAvis.map((avis, index) => (
                        <View key={index} style={styles.avisCardHorizontal}>
                          <View style={styles.avisHeader}>
                            <View style={styles.avisUserInfo}>
                              <View style={styles.avisAvatar}>
                                <Ionicons name="person" size={20} color={theme.colors.primary[500]} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.avisUserName} numberOfLines={1}>
                                  {avis.client.nom_complet}
                                </Text>
                                <View style={styles.avisStars}>
                                  {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                      key={i}
                                      name={i < avis.note ? 'star' : 'star-outline'}
                                      size={12}
                                      color="#FFB800"
                                    />
                                  ))}
                                </View>
                              </View>
                            </View>
                          </View>
                          
                          <View style={styles.avisContent}>
                            {avis.commentaire && (
                              <Text style={styles.avisComment} numberOfLines={3}>
                                "{avis.commentaire}"
                              </Text>
                            )}
                          </View>
                          
                          <View style={styles.avisFooter}>
                            <Text style={styles.avisTrajet} numberOfLines={1}>
                              {avis.voyage.trajet}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
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
    marginBottom: theme.spacing.md, // Espace sous le titre
  },
  voirToutText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.semibold,
  },
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
  },
  sloganHighlight: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary[300],
    textDecorationLine: 'underline',
  },
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
  },
  cooperativeImageHorizontal: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
  // ✅ NOUVEAUX STYLES POUR AVIS HORIZONTAL
  avisCardHorizontal: {
    width: 280, // Largeur fixe pour le scroll horizontal
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
    justifyContent: 'space-between',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisUserName: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  avisStars: {
    flexDirection: 'row',
    gap: 2,
  },
  avisContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avisComment: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  avisFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[100],
    paddingTop: 8,
  },
  avisTrajet: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.medium,
  },
});