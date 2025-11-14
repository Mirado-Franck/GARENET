// app/(client)/historique/detailVoyage.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService, Reservation } from '../../../services/reservationService';
import { theme } from '../../../constants/theme';
import AvisModal from '../../../components/ui/AvisModal'; // ✅ Import ajouté

export default function DetailVoyage() {
  const params = useLocalSearchParams();
  const reservationId = parseInt(params.id as string);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // ✅ État modal ajouté

  useEffect(() => {
    loadReservation();
  }, []);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const historique = await reservationService.getHistorique();
      const found = historique.find(r => r.id === reservationId);
      setReservation(found || null);
    } catch (error) {
      console.error('Erreur chargement détail:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler modifié pour ouvrir la modal
  const handleDonnerAvis = () => {
    setModalVisible(true);
  };

  // ✅ Callback après succès de l'avis
  const handleAvisSuccess = () => {
    // Recharger la réservation pour mettre à jour avis_donne
    loadReservation();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>Voyage introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prixTotal = reservation.nombre_places * reservation.voyage.prix;
  
  // ✅ Info du trajet pour la modal
  const trajetInfo = `${reservation.voyage.trajet.depart} → ${reservation.voyage.trajet.arrivee}`;

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du voyage</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Carte principale */}
        <View style={styles.mainCard}>
          <Text style={styles.codeReservation}>{reservation.code_reservation}</Text>
          <Text style={styles.dateReservation}>
            Réservé le {formatDate(reservation.date_reservation)}
          </Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.semantic.success} />
            <Text style={styles.statusText}>Voyage terminé</Text>
          </View>
        </View>

        {/* Trajet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajet</Text>
          <View style={styles.trajetContainer}>
            <View style={styles.trajetPoint}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={24} color={theme.colors.semantic.success} />
              </View>
              <View style={styles.trajetInfo}>
                <Text style={styles.trajetLabel}>Départ</Text>
                <Text style={styles.trajetText}>{reservation.voyage.trajet.depart}</Text>
              </View>
            </View>
            
            <View style={styles.trajetLine}>
              <View style={styles.dashedLine} />
              <Text style={styles.distanceText}>{reservation.voyage.trajet.distance} km</Text>
            </View>
            
            <View style={styles.trajetPoint}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={24} color={theme.colors.semantic.error} />
              </View>
              <View style={styles.trajetInfo}>
                <Text style={styles.trajetLabel}>Arrivée</Text>
                <Text style={styles.trajetText}>{reservation.voyage.trajet.arrivee}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date et heure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure du voyage</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Date de départ</Text>
            <Text style={styles.infoValue}>{formatDate(reservation.voyage.date_depart)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Heure de départ</Text>
            <Text style={styles.infoValue}>{formatHeure(reservation.voyage.heure_depart)}</Text>
          </View>
        </View>

        {/* Places */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos places</Text>
          <View style={styles.placesGrid}>
            {reservation.places.map((place, index) => (
              <View key={index} style={styles.placeChip}>
                <Ionicons name="ticket" size={16} color={theme.colors.primary[500]} />
                <Text style={styles.placeText}>{place}</Text>
              </View>
            ))}
          </View>
          <View style={styles.nombrePlacesContainer}>
            <Text style={styles.nombrePlacesLabel}>Nombre de places :</Text>
            <Text style={styles.nombrePlacesValue}>{reservation.nombre_places}</Text>
          </View>
        </View>

        {/* Prix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant payé</Text>
          <View style={styles.prixRow}>
            <Text style={styles.prixLabel}>Prix unitaire</Text>
            <Text style={styles.prixValue}>{reservation.voyage.prix.toLocaleString()} Ar</Text>
          </View>
          <View style={styles.prixRow}>
            <Text style={styles.prixLabel}>Nombre de places</Text>
            <Text style={styles.prixValue}>× {reservation.nombre_places}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.prixRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{prixTotal.toLocaleString()} Ar</Text>
          </View>
        </View>

        {/* Coopérative */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coopérative</Text>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoValue}>{reservation.voyage.cooperative.nom}</Text>
          </View>
        </View>

        {/* Véhicule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Véhicule</Text>
          <View style={styles.infoRow}>
            <Ionicons name="car" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Modèle</Text>
            <Text style={styles.infoValue}>{reservation.voyage.voiture.modele}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="card" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Immatriculation</Text>
            <Text style={styles.infoValue}>{reservation.voyage.voiture.immatriculation}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton fixe en bas */}
      <View style={styles.footer}>
        {!reservation.avis_donne ? (
          <TouchableOpacity style={styles.avisButton} onPress={handleDonnerAvis}>
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.avisButtonText}>Donner mon avis sur ce voyage</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.avisGivenContainer}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.semantic.success} />
            <Text style={styles.avisGivenText}>Vous avez déjà donné votre avis pour ce voyage</Text>
          </View>
        )}
      </View>

      {/* ✅ Modal d'avis */}
      <AvisModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        voyageId={reservation.voyage.id || 0}
        trajetInfo={trajetInfo}
        onSuccess={handleAvisSuccess}
      />
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
  codeReservation: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.sm,
  },
  dateReservation: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.semantic.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.semantic.success,
  },
  statusText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.semantic.success,
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
  trajetContainer: {
    paddingVertical: theme.spacing.sm,
  },
  trajetPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trajetInfo: {
    flex: 1,
  },
  trajetLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  trajetText: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  trajetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 25,
    paddingVertical: theme.spacing.md,
  },
  dashedLine: {
    width: 3,
    height: 40,
    backgroundColor: theme.colors.neutral[300],
    marginRight: theme.spacing.md,
  },
  distanceText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  placeText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  nombrePlacesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  nombrePlacesLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  nombrePlacesValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  prixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  prixLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  prixValue: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[300],
    marginVertical: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  avisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#FFB800',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  avisButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: '#fff',
  },
  avisGivenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  avisGivenText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
});