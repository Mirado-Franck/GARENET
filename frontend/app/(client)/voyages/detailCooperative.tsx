// app/(client)/voyages/detailCooperative.tsx
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
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cooperativeService, CooperativeDetail, MoyenneAvisResponse } from '../../../services/cooperativeService';
import { avisService, AvisFormatted, AvisCooperativeResponse } from '../../../services/avisService';
import { theme } from '../../../constants/theme';
import { UPLOADS_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

// ============================================================
// COMPOSANT : Barre de progression pour la répartition des notes
// ============================================================
const RatingBar = ({ stars, count, total }: { stars: number; count: number; total: number }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.starLabel}>{stars}</Text>
      <Ionicons name="star" size={10} color="#FFB800" />
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.countLabel}>{count}</Text>
    </View>
  );
};

// ============================================================
// COMPOSANT : Carte d'avis individuelle
// ============================================================
const ReviewCard = ({ avis }: { avis: AvisFormatted }) => {
  const getInitial = () => {
    if (avis.client?.prenom) return avis.client.prenom.charAt(0).toUpperCase();
    if (avis.client?.nom) return avis.client.nom.charAt(0).toUpperCase();
    return 'U';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.reviewCard}>
      {/* Header de l'avis */}
      <View style={styles.reviewHeader}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(avis.client?.nom || '') }]}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {avis.client?.prenom || ''} {avis.client?.nom || 'Utilisateur'}
          </Text>
          <Text style={styles.reviewDate}>{formatDate(avis.date_creation)}</Text>
        </View>
      </View>

      {/* Étoiles */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= avis.note ? 'star' : 'star-outline'}
            size={14}
            color="#FFB800"
          />
        ))}
      </View>

      {/* Commentaire */}
      {avis.commentaire && (
        <Text style={styles.reviewComment} numberOfLines={4}>
          "{avis.commentaire}"
        </Text>
      )}

      {/* Badge voyage vérifié */}
      {avis.voyage && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={12} color={theme.colors.semantic.success} />
          <Text style={styles.verifiedText}>Voyage vérifié • {avis.voyage.trajet}</Text>
        </View>
      )}
    </View>
  );
};

// Fonction pour générer une couleur d'avatar basée sur le nom
const getAvatarColor = (name: string): string => {
  const colors = [
    theme.colors.primary[500],
    theme.colors.secondary[500],
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#F59E0B',
  ];
  const index = name.length % colors.length;
  return colors[index];
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DetailCooperative() {
  const params = useLocalSearchParams();
  const cooperativeId = parseInt(params.id as string);

  // États
  const [cooperative, setCooperative] = useState<CooperativeDetail | null>(null);
  const [moyenneAvis, setMoyenneAvis] = useState<MoyenneAvisResponse | null>(null);
  const [avisList, setAvisList] = useState<AvisFormatted[]>([]);
  const [avisStats, setAvisStats] = useState<AvisCooperativeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger toutes les données en parallèle
      const [coopData, moyData, avisResponse] = await Promise.all([
        cooperativeService.getCooperativeById(cooperativeId),
        cooperativeService.getMoyenneAvis(cooperativeId),
        avisService.getAvisByCooperative(cooperativeId, 20), // Limite à 20 avis
      ]);

      setCooperative(coopData);
      setMoyenneAvis(moyData);
      setAvisList(avisResponse.avis);
      setAvisStats(avisResponse);
      
      console.log('📊 Données chargées:', {
        cooperative: coopData.nom,
        totalAvis: avisResponse.count,
        moyenne: avisResponse.moyenne,
        distribution: avisResponse.distribution
      });
      
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleViewVoyages = () => {
    router.push(`/(client)/voyages/voyagePropose?cooperativeId=${cooperativeId}`);
  };

  const handleViewAllReviews = () => {
    // Navigation vers une page liste complète des avis (à créer si besoin)
    router.push(`/(client)/voyages/listeAvis?cooperativeId=${cooperativeId}`);
  };

  const handleCall = (phoneNumber: string) => {
    // Logique pour appeler
    console.log('Appeler:', phoneNumber);
  };

  const handleEmail = (email: string) => {
    // Logique pour envoyer un email
    console.log('Email:', email);
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

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // ============ ERROR STATE ============
  if (!cooperative) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>Coopérative introuvable</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalAvis = avisStats?.count || 0;
  const moyenneNote = avisStats?.moyenne || 0;
  const distribution = avisStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Calcul des critères (mock pour l'instant, à remplacer par de vraies données)
  const criteres = {
    ponctualite: { note: 4.4, percentage: 88 },
    confort: { note: 4.1, percentage: 82 },
    accueil: { note: 4.5, percentage: 90 },
  };

  return (
    <View style={styles.container}>
      {/* ==================== HEADER ==================== */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Agence</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* ==================== PROFIL COOPÉRATIVE ==================== */}
        <View style={styles.profileSection}>
          {/* Logo */}
          <View style={styles.logoWrapper}>
            {cooperative.logo ? (
              <Image
                source={{ uri: `${UPLOADS_URL}/${cooperative.logo}` }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="bus" size={40} color={theme.colors.primary[500]} />
              </View>
            )}
          </View>

          {/* Nom et code */}
          <Text style={styles.coopName}>{cooperative.nom}</Text>
          <Text style={styles.coopCode}>{cooperative.code_cooperative}</Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
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
              <Ionicons
                name={cooperative.statut === 'actif' ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={cooperative.statut === 'actif' ? theme.colors.semantic.success : theme.colors.text.secondary}
              />
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
                {cooperative.statut === 'actif' ? 'Vérifié' : 'Inactif'}
              </Text>
            </View>

            {totalAvis > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingBadgeText}>{moyenneNote.toFixed(1)}</Text>
                <Text style={styles.ratingCountBadge}>({totalAvis})</Text>
              </View>
            )}

            {cooperative.date_inscription && (
              <View style={styles.yearBadge}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={styles.yearText}>
                  Depuis {new Date(cooperative.date_inscription).getFullYear()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ==================== STATISTIQUES & AVIS ==================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📊 Statistiques des avis</Text>
            {totalAvis > 0 && (
              <TouchableOpacity onPress={handleViewAllReviews}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>

          {totalAvis > 0 ? (
            <>
              <View style={styles.statsContainer}>
                {/* GAUCHE : Note Globale */}
                <View style={styles.bigRatingBox}>
                  <Text style={styles.bigRatingText}>{moyenneNote.toFixed(1)}</Text>
                  <View style={styles.bigStarsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= Math.round(moyenneNote) ? 'star' : 'star-outline'}
                        size={16}
                        color="#FFB800"
                      />
                    ))}
                  </View>
                  <Text style={styles.totalReviewsText}>
                    {totalAvis} {totalAvis > 1 ? 'avis' : 'avis'}
                  </Text>
                </View>

                {/* DROITE : Barres de répartition */}
                <View style={styles.distributionBox}>
                  <RatingBar stars={5} count={distribution[5]} total={totalAvis} />
                  <RatingBar stars={4} count={distribution[4]} total={totalAvis} />
                  <RatingBar stars={3} count={distribution[3]} total={totalAvis} />
                  <RatingBar stars={2} count={distribution[2]} total={totalAvis} />
                  <RatingBar stars={1} count={distribution[1]} total={totalAvis} />
                </View>
              </View>

              {/* CRITÈRES SPÉCIFIQUES */}
              <View style={styles.criteriaSection}>
                <Text style={styles.criteriaTitle}>Critères détaillés</Text>
                
                <View style={styles.criteriaItem}>
                  <View style={styles.criteriaLabelRow}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.primary[500]} />
                    <Text style={styles.criteriaLabel}>Ponctualité</Text>
                  </View>
                  <View style={styles.criteriaBarBG}>
                    <View style={[styles.criteriaBarFill, { width: `${criteres.ponctualite.percentage}%` }]} />
                  </View>
                  <Text style={styles.criteriaScore}>{criteres.ponctualite.note}</Text>
                </View>

                <View style={styles.criteriaItem}>
                  <View style={styles.criteriaLabelRow}>
                    <Ionicons name="car-outline" size={16} color={theme.colors.primary[500]} />
                    <Text style={styles.criteriaLabel}>Confort</Text>
                  </View>
                  <View style={styles.criteriaBarBG}>
                    <View style={[styles.criteriaBarFill, { width: `${criteres.confort.percentage}%` }]} />
                  </View>
                  <Text style={styles.criteriaScore}>{criteres.confort.note}</Text>
                </View>

                <View style={styles.criteriaItem}>
                  <View style={styles.criteriaLabelRow}>
                    <Ionicons name="people-outline" size={16} color={theme.colors.primary[500]} />
                    <Text style={styles.criteriaLabel}>Accueil</Text>
                  </View>
                  <View style={styles.criteriaBarBG}>
                    <View style={[styles.criteriaBarFill, { width: `${criteres.accueil.percentage}%` }]} />
                  </View>
                  <Text style={styles.criteriaScore}>{criteres.accueil.note}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.noReviewsTitle}>Aucun avis pour le moment</Text>
              <Text style={styles.noReviewsText}>
                Soyez le premier à donner votre avis après un voyage !
              </Text>
            </View>
          )}
        </View>

        {/* ==================== DERNIERS COMMENTAIRES ==================== */}
        {avisList.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💬 Derniers commentaires</Text>
              <TouchableOpacity onPress={handleViewAllReviews}>
                <Text style={styles.seeAllText}>Voir tout ({totalAvis})</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScrollContent}
            >
              {avisList.slice(0, 5).map((avis, index) => (
                <ReviewCard key={avis.id || index} avis={avis} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ==================== INFORMATIONS DE CONTACT ==================== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Informations de contact</Text>

          <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
            <View style={styles.infoIconBox}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{cooperative.adresse}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow} 
            activeOpacity={0.7}
            onPress={() => handleCall(cooperative.contact)}
          >
            <View style={styles.infoIconBox}>
              <Ionicons name="call-outline" size={20} color={theme.colors.primary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{cooperative.contact}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {cooperative.email && (
            <TouchableOpacity 
              style={styles.infoRow} 
              activeOpacity={0.7}
              onPress={() => handleEmail(cooperative.email!)}
            >
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.primary[500]} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{cooperative.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* ==================== STATIONS ==================== */}
        {cooperative.stations && cooperative.stations.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏢 Stations ({cooperative.stations.length})</Text>
            
            {cooperative.stations.map((station: any, index: number) => (
              <View key={index} style={styles.stationCard}>
                <View style={styles.stationIconBox}>
                  <Ionicons name="business-outline" size={20} color={theme.colors.primary[500]} />
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.nom}</Text>
                  {station.localisation && (
                    <View style={styles.stationLocation}>
                      <Ionicons name="location-outline" size={12} color={theme.colors.text.tertiary} />
                      <Text style={styles.stationLocationText}>{station.localisation}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== VÉHICULES ==================== */}
        {cooperative.voitures && cooperative.voitures.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                🚐 Véhicules ({cooperative.voitures.length})
              </Text>
              {cooperative.voitures.length > 3 && (
                <TouchableOpacity onPress={() => setShowAllVehicles(!showAllVehicles)}>
                  <Text style={styles.seeAllText}>
                    {showAllVehicles ? 'Voir moins' : 'Voir tout'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {cooperative.voitures.slice(0, showAllVehicles ? undefined : 3).map((voiture: any, index: number) => (
              <View key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleIconBox}>
                  <Ionicons name="car-sport-outline" size={24} color={theme.colors.primary[500]} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{voiture.modele}</Text>
                  <View style={styles.vehicleDetailsRow}>
                    <Text style={styles.vehicleImmat}>{voiture.immatriculation}</Text>
                    <Text style={styles.vehicleSeparator}>•</Text>
                    <View style={styles.vehicleCapacity}>
                      <Ionicons name="people-outline" size={12} color={theme.colors.text.secondary} />
                      <Text style={styles.vehicleCapacityText}>{voiture.capacite} places</Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.vehicleStatus,
                    {
                      backgroundColor:
                        voiture.disponibilite === 'disponible'
                          ? theme.colors.semantic.success + '20'
                          : theme.colors.neutral[200],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.vehicleStatusDot,
                      {
                        backgroundColor:
                          voiture.disponibilite === 'disponible'
                            ? theme.colors.semantic.success
                            : theme.colors.neutral[400],
                      },
                    ]}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color:
                        voiture.disponibilite === 'disponible'
                          ? theme.colors.semantic.success
                          : theme.colors.text.secondary,
                    }}
                  >
                    {voiture.disponibilite === 'disponible' ? 'Disponible' : 'Indisponible'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== PROCHAINS VOYAGES ==================== */}
        {cooperative.prochains_voyages && cooperative.prochains_voyages.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                🗓️ Prochains départs ({cooperative.prochains_voyages.length})
              </Text>
              {cooperative.prochains_voyages.length > 3 && (
                <TouchableOpacity onPress={() => setShowAllTrips(!showAllTrips)}>
                  <Text style={styles.seeAllText}>
                    {showAllTrips ? 'Voir moins' : 'Voir tout'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {cooperative.prochains_voyages.slice(0, showAllTrips ? undefined : 3).map((voyage: any, index: number) => (
              <TouchableOpacity key={index} style={styles.tripCard} activeOpacity={0.7}>
                <View style={styles.tripIconBox}>
                  <Ionicons name="navigate-outline" size={20} color="#fff" />
                </View>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripRoute}>
                    {voyage.trajet?.station_depart} → {voyage.trajet?.station_arrivee}
                  </Text>
                  <View style={styles.tripDetailsRow}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.text.secondary} />
                    <Text style={styles.tripDate}>
                      {new Date(voyage.date_depart).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripPriceContainer}>
                  <Text style={styles.tripPrice}>{voyage.prix?.toLocaleString()}</Text>
                  <Text style={styles.tripCurrency}>Ar</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Espace pour le footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ==================== FOOTER FIXE ==================== */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleViewVoyages}>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>Voir tous les voyages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.semantic.error,
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary[500],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
    ...theme.shadows.md,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  coopCode: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 15,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingCountBadge: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  yearText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary[500],
    fontWeight: '600',
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bigRatingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: theme.colors.neutral[200],
  },
  bigRatingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  bigStarsRow: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 2,
  },
  totalReviewsText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 8,
  },
  distributionBox: {
    flex: 1.5,
    paddingLeft: 15,
    justifyContent: 'center',
  },

  // Rating Bar
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    width: 12,
    marginRight: 2,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    marginHorizontal: 8,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    width: 25,
    textAlign: 'right',
  },

  // Criteria
  criteriaSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: 15,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  criteriaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 6,
  },
  criteriaLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  criteriaBarBG: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    marginHorizontal: 10,
  },
  criteriaBarFill: {
    height: 8,
    backgroundColor: theme.colors.primary[400],
    borderRadius: 4,
  },
  criteriaScore: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    width: 30,
    textAlign: 'right',
  },

  // No Reviews
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noReviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 15,
  },
  noReviewsText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },

  // Reviews Scroll
  reviewsScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 15,
  },

  // Review Card
  reviewCard: {
    width: 280,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    ...theme.shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
    backgroundColor: theme.colors.semantic.success + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    color: theme.colors.semantic.success,
    fontWeight: '500',
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },

  // Station Card
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  stationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  stationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  stationLocationText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },

  // Vehicle Card
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  vehicleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vehicleImmat: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  vehicleSeparator: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginHorizontal: 6,
  },
  vehicleCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleCapacityText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  vehicleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  vehicleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Trip Card
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tripIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  tripDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  tripDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  tripPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary[500],
  },
  tripCurrency: {
    fontSize: 12,
    color: theme.colors.primary[500],
    marginLeft: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    ...theme.shadows.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});