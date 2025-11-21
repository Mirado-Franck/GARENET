import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService, Reservation } from '../../../services/reservationService';
import { theme } from '../../../constants/theme';
import AvisModal from '../../../components/ui/AvisModal';

export default function ListeVoyage() {
  const [voyages, setVoyages] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<{
    voyageId: number;
    trajetInfo: string;
  } | null>(null);

  useEffect(() => {
    loadHistorique();
  }, []);

  const loadHistorique = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getHistorique();
      setVoyages(data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistorique();
  };

  const handleViewDetails = (reservationId: number) => {
    router.push(`/(client)/historique/detailVoyage?id=${reservationId}`);
  };

  const handleDonnerAvis = (reservation: Reservation) => {
    setSelectedVoyage({
      voyageId: reservation.voyage.id || 0,
      trajetInfo: `${reservation.voyage.trajet.depart} → ${reservation.voyage.trajet.arrivee}`,
    });
    setModalVisible(true);
  };

  const handleAvisSuccess = () => {
    loadHistorique();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderVoyageCard = ({ item }: { item: Reservation }) => {
    const prixTotal = item.nombre_places * item.voyage.prix;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.codeReservation}>{item.code_reservation}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.semantic.success} />
            <Text style={styles.statusText}>Terminé</Text>
          </View>
        </View>

        {/* Date de voyage */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary[500]} />
          <Text style={styles.dateText}>
            Voyage du {formatDate(item.voyage.date_depart)}
          </Text>
        </View>

        {/* Trajet */}
        <View style={styles.trajetContainer}>
          <View style={styles.trajetPoint}>
            <Ionicons name="location" size={20} color={theme.colors.semantic.success} />
            <Text style={styles.trajetText}>{item.voyage.trajet.depart}</Text>
          </View>
          <View style={styles.trajetLine}>
            <View style={styles.dashedLine} />
            <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          </View>
          <View style={styles.trajetPoint}>
            <Ionicons name="location" size={20} color={theme.colors.semantic.error} />
            <Text style={styles.trajetText}>{item.voyage.trajet.arrivee}</Text>
          </View>
        </View>

        {/* Infos */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="ticket-outline" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.infoText}>{item.places.join(', ')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="business-outline" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.infoText}>{item.voyage.cooperative.nom}</Text>
          </View>
        </View>

        {/* Prix */}
        <View style={styles.prixContainer}>
          <Text style={styles.prixLabel}>Total payé</Text>
          <Text style={styles.prixValue}>{prixTotal.toLocaleString()} Ar</Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item.id)}
          >
            <Ionicons name="eye-outline" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.detailsButtonText}>Voir détails</Text>
          </TouchableOpacity>

          {!item.avis_donne && (
            <TouchableOpacity
              style={styles.avisButton}
              onPress={() => handleDonnerAvis(item)}
            >
              <Ionicons name="star-outline" size={16} color="#FFB800" />
              <Text style={styles.avisButtonText}>Donner un avis</Text>
            </TouchableOpacity>
          )}

          {item.avis_donne && (
            <View style={styles.avisGivenBadge}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.avisGivenText}>Avis donné</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header avec flèche de retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Historique de mes voyages</Text>
          <Text style={styles.subtitle}>
            {voyages.length} {voyages.length > 1 ? 'voyages terminés' : 'voyage terminé'}
          </Text>
        </View>
      </View>

      {/* Liste */}
      {voyages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={80} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Aucun voyage dans l'historique</Text>
          <Text style={styles.emptySubtitle}>
            Vos voyages terminés apparaîtront ici.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(client)/voyages')}
          >
            <Text style={styles.emptyButtonText}>Rechercher un voyage</Text>
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary[500]]}
            />
          }
        />
      )}

      {/* Modal d'avis */}
      {selectedVoyage && (
        <AvisModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedVoyage(null);
          }}
          voyageId={selectedVoyage.voyageId}
          trajetInfo={selectedVoyage.trajetInfo}
          onSuccess={handleAvisSuccess}
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row', // ✅ Ajout
    alignItems: 'center', // ✅ Ajout
  },
  backButton: { // ✅ NOUVEAU
    marginRight: theme.spacing.md,
  },
  headerTextContainer: { // ✅ NOUVEAU
    flex: 1,
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
  listContent: {
    padding: theme.spacing.lg,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  codeReservation: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.semantic.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.semantic.success,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
  },
  dateText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
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
  },
  dashedLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.neutral[300],
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  prixContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  prixLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  prixValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
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
  avisButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FFF9E6',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  avisButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: '#FFB800',
  },
  avisGivenBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm,
  },
  avisGivenText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
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
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});