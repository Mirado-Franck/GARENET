import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Theme } from '../../../constants/theme';
import { avisService, AvisFormatted, AvisCooperativeResponse } from '../../../services/avisService';
import { cooperativeService, CooperativeDetail } from '../../../services/cooperativeService';

// Carte d'avis réutilisable (version verticale)
const ReviewCard = ({ avis }: { avis: AvisFormatted }) => {
  const { theme } = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.background.primary,
          padding: 16,
          borderRadius: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.colors.neutral[100],
          ...theme.shadows.sm,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        },
        avatar: {
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
        nameLine: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        dateText: {
          fontSize: 11,
          color: theme.colors.text.tertiary,
          marginTop: 2,
        },
        starsRow: {
          flexDirection: 'row',
          marginBottom: 8,
          gap: 2,
        },
        comment: {
          fontSize: 13,
          color: theme.colors.text.secondary,
          lineHeight: 20,
          fontStyle: 'italic',
          marginBottom: 8,
        },
        voyageInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 4,
          gap: 4,
        },
        voyageText: {
          fontSize: 12,
          color: theme.colors.text.tertiary,
        },
      }),
    [theme]
  );

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
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(avis.client?.nom || '') }]}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
        <View>
          <Text style={styles.nameLine}>
            {avis.client?.prenom || ''} {avis.client?.nom || 'Utilisateur'}
          </Text>
          <Text style={styles.dateText}>{formatDate(avis.date_creation)}</Text>
        </View>
      </View>

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

      {avis.commentaire && (
        <Text style={styles.comment}>
          "{avis.commentaire}"
        </Text>
      )}

      {avis.voyage && avis.voyage.trajet && (
        <View style={styles.voyageInfo}>
          <Ionicons name="navigate-outline" size={12} color={theme.colors.text.tertiary} />
          <Text style={styles.voyageText}>{avis.voyage.trajet}</Text>
        </View>
      )}
    </View>
  );
};
// ============================================================
// PETIT COMPOSANT : Barre de répartition des notes
// ============================================================
const RatingBar = ({ stars, count, total }: { stars: number; count: number; total: number }) => {
  const { theme } = useTheme();
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
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
        progressBackground: {
          flex: 1,
          height: 8,
          backgroundColor: theme.colors.neutral[200],
          borderRadius: 4,
          marginHorizontal: 8,
        },
        progressFill: {
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
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.starLabel}>{stars}</Text>
      <Ionicons name="star" size={10} color="#FFB800" />
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.countLabel}>{count}</Text>
    </View>
  );
};
export default function AvisCooperative() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const cooperativeId = parseInt(params.cooperativeId as string);

  const [cooperative, setCooperative] = useState<CooperativeDetail | null>(null);
  const [avis, setAvis] = useState<AvisFormatted[]>([]);
  const [stats, setStats] = useState<AvisCooperativeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = React.useMemo(() => createStyles(theme), [theme]);

useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coop, avisResponse] = await Promise.all([
        cooperativeService.getCooperativeById(cooperativeId),
        avisService.getAvisByCooperative(cooperativeId, 200), // on récupère “beaucoup” d’avis
      ]);

      setCooperative(coop);
      setAvis(avisResponse.avis);
      setStats(avisResponse);
    } catch (e: any) {
      console.error('Erreur chargement avis coopérative:', e);
      setError("Impossible de charger les avis de cette coopérative");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalAvis = stats?.count || 0;
  const moyenneNote = stats?.moyenne || 0;
  const distribution = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des avis...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Avis de la coopérative</Text>
          {cooperative && (
            <Text style={styles.headerSubtitle}>{cooperative.nom}</Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* Statistiques globales */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.bigRatingText}>{moyenneNote.toFixed(1)}</Text>
            <View style={styles.bigStarsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={i <= Math.round(moyenneNote) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>
              {totalAvis} {totalAvis > 1 ? 'avis' : 'avis'}
            </Text>
          </View>
          <View style={styles.statsRight}>
            <RatingBar stars={5} count={distribution[5]} total={totalAvis} />
            <RatingBar stars={4} count={distribution[4]} total={totalAvis} />
            <RatingBar stars={3} count={distribution[3]} total={totalAvis} />
            <RatingBar stars={2} count={distribution[2]} total={totalAvis} />
            <RatingBar stars={1} count={distribution[1]} total={totalAvis} />
          </View>
        </View>

        {/* Liste des avis */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>Tous les avis</Text>
          <Text style={styles.listHeaderCount}>{totalAvis} résultat(s)</Text>
        </View>

        {avis.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Aucun avis pour le moment</Text>
            <Text style={styles.emptySubtitle}>
              Les voyageurs pourront déposer un avis après leurs voyages avec cette coopérative.
            </Text>
          </View>
        ) : (
          avis.map((a) => <ReviewCard key={a.id} avis={a} />)
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Styles dépendants du thème
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background.secondary,
    },
    loadingText: {
      marginTop: 15,
      color: theme.colors.text.secondary,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.semantic.error,
      marginTop: 15,
      marginBottom: 20,
      textAlign: 'center',
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
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 30,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.primary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      ...theme.shadows.sm,
    },
    statsLeft: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 10,
      borderRightWidth: 1,
      borderRightColor: theme.colors.neutral[200],
    },
    statsRight: {
      flex: 1.5,
      paddingLeft: 12,
      justifyContent: 'center',
    },
    bigRatingText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    bigStarsRow: {
      flexDirection: 'row',
      marginTop: 4,
      gap: 2,
    },
    totalReviewsText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    listHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 12,
    },
    listHeaderTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    listHeaderCount: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 12,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });