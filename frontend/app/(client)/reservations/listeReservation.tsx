import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService, Reservation } from '../../../services/reservationService';
import { Toast } from '../../../components/ui/Toast';
import { theme } from '../../../constants/theme';

export default function ListeReservation() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
    const [reservation, setReservation] = useState<Reservation | null>(null);
  // ✅ États pour le Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // ✅ Modal de confirmation annulation
    const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMyReservations();
      
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.warn('⚠️ Réponse invalide, pas un tableau:', data);
        setReservations([]);
      }
    } catch (error: any) {
      console.error('Erreur chargement réservations:', error);
      setReservations([]);
      setToastMessage('Impossible de charger vos réservations');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleCancelReservation = () => {
    if (!reservation) return;
    setShowCancelModal(true);
  };

  const performCancellation = async () => {
    setShowCancelModal(false);
    
    try {
      await reservationService.cancelReservation(reservation!.id);
      
      setToastMessage('Réservation annulée avec succès');
      setToastType('success');
      setToastVisible(true);
      
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      setToastMessage(error.error || 'Impossible d\'annuler la réservation');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleViewDetails = (reservationId: number) => {
    router.push(`/(client)/reservations/detailReservation?id=${reservationId}`);
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      confirmee: { color: theme.colors.semantic.success, label: 'Confirmée', icon: 'checkmark-circle' },
      en_attente: { color: theme.colors.semantic.warning, label: 'En attente', icon: 'time' },
      annulee: { color: theme.colors.semantic.error, label: 'Annulée', icon: 'close-circle' },
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || {
      color: theme.colors.neutral[500],
      label: statut,
      icon: 'help-circle',
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
        <Ionicons name={config.icon as any} size={16} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
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

  const renderReservationCard = (reservation: Reservation) => {
    const prixTotal = reservation.nombre_places * reservation.voyage.prix;

    return (
      <View key={reservation.id} style={styles.card}>
        {/* Header carte */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardCode}>{reservation.code_reservation}</Text>
            <Text style={styles.cardDate}>
              Réservé le {formatDate(reservation.date_reservation)}
            </Text>
          </View>
          {getStatusBadge(reservation.statut)}
        </View>

        {/* Trajet */}
        <View style={styles.trajetContainer}>
          <View style={styles.trajetPoint}>
            <Ionicons name="location" size={20} color={theme.colors.semantic.success} />
            <Text style={styles.trajetText}>{reservation.voyage.trajet.depart}</Text>
          </View>
          <View style={styles.trajetLine}>
            <View style={styles.dashedLine} />
            <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          </View>
          <View style={styles.trajetPoint}>
            <Ionicons name="location" size={20} color={theme.colors.semantic.error} />
            <Text style={styles.trajetText}>{reservation.voyage.trajet.arrivee}</Text>
          </View>
        </View>

        {/* Infos voyage */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Départ :</Text>
            <Text style={styles.infoValue}>{formatDate(reservation.voyage.date_depart)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Heure :</Text>
            <Text style={styles.infoValue}>{formatHeure(reservation.voyage.heure_depart)}</Text>
          </View>
        </View>

        {/* Places et prix */}
        <View style={styles.placesContainer}>
          <View style={styles.placesLeft}>
            <Ionicons name="ticket-outline" size={18} color={theme.colors.primary[500]} />
            <Text style={styles.placesLabel}>Places :</Text>
            <Text style={styles.placesValue}>{reservation.places.join(', ')}</Text>
          </View>
          <Text style={styles.prixTotal}>{prixTotal.toLocaleString()} Ar</Text>
        </View>

        {/* Coopérative */}
        <View style={styles.cooperativeInfo}>
          <Ionicons name="business-outline" size={16} color={theme.colors.neutral[600]} />
          <Text style={styles.cooperativeName}>{reservation.voyage.cooperative.nom}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.voitureInfo}>{reservation.voyage.voiture.modele}</Text>
        </View>

        {/* Boutons d'action */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(reservation.id)}
          >
            <Ionicons name="eye-outline" size={18} color={theme.colors.primary[500]} />
            <Text style={styles.detailsButtonText}>Voir détails</Text>
          </TouchableOpacity>

          {/* {reservation.statut === 'confirmee' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelReservation(reservation)}
            >
              <Ionicons name="close-circle-outline" size={18} color={theme.colors.semantic.error} />
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Réservations</Text>
        <Text style={styles.subtitle}>
          {reservations.length} {reservations.length > 1 ? 'réservations' : 'réservation'}
        </Text>
      </View>
      {/* Liste des réservations */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {reservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySubtitle}>
              Vous n'avez pas encore effectué de réservation.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(client)/voyages')}
            >
              <Text style={styles.emptyButtonText}>Rechercher un voyage</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reservations.map((reservation) => renderReservationCard(reservation))
        )}
      </ScrollView>

      {/* ✅ Toast notification */}
      {toastVisible && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onHide={() => setToastVisible(false)}
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
    backgroundColor: theme.colors.background.secondary,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardCode: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  trajetContainer: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
  infoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  placesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    marginBottom: theme.spacing.sm,
  },
  placesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  placesLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  placesValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  prixTotal: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  cooperativeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  cooperativeName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  separator: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.neutral[400],
  },
  voitureInfo: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  cardActions: {
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
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.semantic.error + '10',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.semantic.error,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.semantic.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
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