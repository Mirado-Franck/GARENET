// frontend/app/(client)/voyages/reservation.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image, // 👈 AJOUT
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { voyageService, PlacesVoyageResponse, Place } from '../../../services/voyageService';
import { reservationService } from '../../../services/reservationService';
import { Toast } from '../../../components/ui/Toast';
import { useTheme } from '../../../contexts/ThemeContext';
import type { Theme } from '../../../constants/theme';

export default function Reservation() {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const params = useLocalSearchParams();
  const voyageId = parseInt(params.voyageId as string);
  const prixUnitaire = parseFloat(params.prix as string);

  const [placesData, setPlacesData] = useState<PlacesVoyageResponse | null>(null);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 👇 NOUVEAU : modal choix moyen de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{ reservationId: number; montant: number } | null>(null);

  const prixTotal = selectedPlaces.length * prixUnitaire;

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await voyageService.getPlacesByVoyage(voyageId);
      setPlacesData(data);
    } catch (error: any) {
      console.error('Erreur chargement places:', error);
      Alert.alert('Erreur', 'Impossible de charger les places disponibles');
    } finally {
      setLoading(false);
    }
  };

  const togglePlace = (numero: string, place: Place) => {
    if (!place.selectionnable) return;

    if (selectedPlaces.includes(numero)) {
      setSelectedPlaces(selectedPlaces.filter((p) => p !== numero));
    } else {
      setSelectedPlaces([...selectedPlaces, numero]);
    }
  };

  const handleValidate = () => {
    if (selectedPlaces.length === 0) {
      Alert.alert('Attention', 'Veuillez sélectionner au moins une place');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmReservation = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      const response = await reservationService.createPendingReservation({
        code_voyage_id: voyageId,
        places: selectedPlaces,
      });

      console.log('✅ Réservation en attente créée:', response);

      const dataForPayment = {
        reservationId: response.reservation.id,
        voyageId: voyageId,
        places: selectedPlaces,
        montant: prixTotal,
        code_reservation: response.reservation.code_reservation,
        voyage: response.reservation.voyage,
      };

      await AsyncStorage.setItem('temp_reservation', JSON.stringify(dataForPayment));
      console.log('📦 Données stockées dans AsyncStorage');

      // On garde en mémoire pour le bouton MVola
      setPendingPayment({
        reservationId: response.reservation.id,
        montant: prixTotal,
      });

      setToastMessage('Réservation en attente créée ! Choisissez un moyen de paiement.');
      setToastType('success');
      setToastVisible(true);

      // 👉 On n’envoie plus directement vers paiement
      // On ouvre le modal "Choix de moyen de paiement"
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('❌ Erreur création réservation:', error);

      if (error.error?.includes('Déjà réservé')) {
        setToastMessage('Une ou plusieurs places ont été réservées entre temps');
      } else if (error.error?.includes('Place(s) introuvable')) {
        setToastMessage('Places sélectionnées invalides');
      } else {
        setToastMessage(error.error || 'Erreur lors de la réservation');
      }

      setToastType('error');
      setToastVisible(true);

      loadPlaces();
    } finally {
      setSubmitting(false);
    }
  };

  // 👇 Quand l’utilisateur choisit MVola dans le second modal
  const handleSelectMvola = () => {
    if (!pendingPayment) {
      setShowPaymentModal(false);
      return;
    }

    setShowPaymentModal(false);

    router.push({
      pathname: '/(client)/voyages/paiement',
      params: {
        reservationId: pendingPayment.reservationId,
        montant: pendingPayment.montant,
      },
    });
  };

  // 👇 Quand l’utilisateur choisit "Payer plus tard"
  const handlePayLater = () => {
    setShowPaymentModal(false);
    // Rediriger vers la liste des réservations
    router.push('/(client)/reservations/listeReservation');
  };

  const getPlaceStyle = (place: Place) => {
    if (place.est_chauffeur) return styles.placeChauffeur;
    if (place.est_reserve) return styles.placeReserved;
    if (selectedPlaces.includes(place.numero)) return styles.placeSelected;
    return styles.placeAvailable;
  };

  const getPlaceTextStyle = (place: Place) => {
    if (place.est_reserve || place.est_chauffeur) return styles.placeTextDisabled;
    if (selectedPlaces.includes(place.numero)) return styles.placeTextSelected;
    return styles.placeTextAvailable;
  };

  const organizeCarLayout = (places: Place[]) => {
    const chauffeur = places.find((place) => place.est_chauffeur);
    const voyageurs = places.filter((place) => !place.est_chauffeur);

    const sortedVoyageurs = voyageurs.sort((a, b) => {
      const numA = parseInt(a.numero);
      const numB = parseInt(b.numero);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.numero.localeCompare(b.numero);
    });

    const rows: Place[][] = [];

    const row1: Place[] = [];
    if (chauffeur) row1.push(chauffeur);

    const avantPassagers = sortedVoyageurs.slice(0, 2);
    row1.push(...avantPassagers);
    rows.push(row1);

    const placesRestantes = sortedVoyageurs.slice(2);
    for (let i = 0; i < placesRestantes.length; i += 4) {
      const row = placesRestantes.slice(i, i + 4);
      rows.push(row);
    }

    return rows;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des places...</Text>
      </View>
    );
  }

  if (!placesData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
      </View>
    );
  }

  const carLayout = organizeCarLayout(placesData.places);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sélectionnez vos places</Text>
          <Text style={styles.subtitle}>Voyage : {placesData.code_voyage}</Text>
          <Text style={styles.subtitle}>Véhicule : {placesData.voiture}</Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.placeAvailable]} />
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.placeSelected]} />
            <Text style={styles.legendText}>Sélectionné</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.placeReserved]} />
            <Text style={styles.legendText}>Réservé</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.placeChauffeur]} />
            <Text style={styles.legendText}>Chauffeur</Text>
          </View>
        </View>

        <View style={styles.carContainer}>
          <View style={styles.carHeader}>
            <Text style={styles.carDirection}>⬆️ Avant du véhicule</Text>
          </View>

          <View style={styles.steeringWheelContainer}>
            <Text style={styles.steeringWheel}>🚗</Text>
          </View>

          <View style={styles.carLayout}>
            {carLayout.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[styles.carRow, rowIndex === 0 && styles.frontRow]}
              >
                {row.map((place: Place, seatIndex: number) => (
                  <TouchableOpacity
                    key={place.numero}
                    style={[
                      styles.seat,
                      getPlaceStyle(place),
                      rowIndex === 0 && styles.frontSeat,
                      seatIndex === 0 && rowIndex === 0 && styles.driverSeat,
                    ]}
                    onPress={() => togglePlace(place.numero, place)}
                    disabled={!place.selectionnable || submitting}
                    activeOpacity={0.7}
                  >
                    <Text style={getPlaceTextStyle(place)}>
                      {place.numero}
                      {seatIndex === 0 && rowIndex === 0 && ' 🪑'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.carFooter}>
            <Text style={styles.carDirection}>⬇️ Arrière du véhicule</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Places sélectionnées :</Text>
            <Text style={styles.summaryValue}>
              {selectedPlaces.length}{' '}
              {selectedPlaces.length > 1 ? 'places' : 'place'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Prix unitaire :</Text>
            <Text style={styles.summaryValue}>
              {prixUnitaire.toLocaleString()} Ar
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total à payer :</Text>
            <Text style={styles.totalValue}>{prixTotal.toLocaleString()} Ar</Text>
          </View>
        </View>

        {selectedPlaces.length > 0 && (
          <View style={styles.selectedPlacesContainer}>
            <Text style={styles.selectedPlacesTitle}>Vos places :</Text>
            <Text style={styles.selectedPlacesList}>
              {selectedPlaces.join(', ')}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.validateButton,
            (selectedPlaces.length === 0 || submitting) &&
              styles.validateButtonDisabled,
          ]}
          onPress={handleValidate}
          disabled={selectedPlaces.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.text.inverse} />
          ) : (
            <Text style={styles.validateButtonText}>
              Valider la réservation ({prixTotal.toLocaleString()} Ar)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation (déjà existant) */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la réservation</Text>

            <Text style={styles.modalMessage}>
              Vous allez réserver {selectedPlaces.length} place(s) pour un total de{' '}
              <Text style={styles.modalPrice}>
                {prixTotal.toLocaleString()} Ar
              </Text>
            </Text>

            <View style={styles.modalPlaces}>
              <Text style={styles.modalPlacesLabel}>Places sélectionnées :</Text>
              <Text style={styles.modalPlacesList}>
                {selectedPlaces.join(', ')}
              </Text>
            </View>

            <Text style={styles.modalInfo}>
              ℹ️ Une réservation sera créée et vous pourrez choisir votre moyen de paiement.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmReservation}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 👇 NOUVEAU : Modal choix moyen de paiement */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentTitle}>Choix de moyen de paiement</Text>
            <Text style={styles.paymentSubtitle}>
              Sélectionnez un moyen de paiement pour régler votre réservation.
            </Text>

            {/* Option MVola */}
            <TouchableOpacity
              style={styles.paymentOption}
              activeOpacity={0.7}
              onPress={handleSelectMvola}
            >
              <View style={styles.paymentOptionLeft}>
                <Image
                  source={require('../../../assets/mvola.png')}
                  style={styles.paymentLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.paymentOptionTitle}>MVola</Text>
                  <Text style={styles.paymentOptionSubtitle}>
                    Paiement mobile rapide et sécurisé
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.neutral[500]}
              />
            </TouchableOpacity>

            {/* Bouton Payer plus tard */}
            <TouchableOpacity
              style={styles.paymentLaterButton}
              onPress={handlePayLater}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.primary[500]}
              />
              <Text style={styles.paymentLaterText}>Payer plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

// Styles
const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
    },
    errorText: {
      fontSize: theme.typography.sizes.body,
      color: theme.colors.semantic.error,
    },
    scrollContent: {
      padding: theme.spacing.xl,
      paddingBottom: 100,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    legendBox: {
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.sm - 4,
    },
    legendText: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
    },
    carContainer: {
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
    },
    carHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    carDirection: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.weights.semibold,
    },
    steeringWheelContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    steeringWheel: {
      fontSize: 24,
    },
    carLayout: {
      alignItems: 'center',
    },
    carRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    frontRow: {
      marginBottom: theme.spacing.xl,
    },

    // sièges (fixes)
    seat: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      borderWidth: 2,
    },
    frontSeat: {
      width: 55,
      height: 55,
    },
    driverSeat: {
      backgroundColor: '#FFF3E0',
      borderColor: '#F59E0B',
      width: 60,
      height: 60,
    },
    placeAvailable: {
      backgroundColor: '#E8F5E9',
      borderColor: '#22C55E',
    },
    placeSelected: {
      backgroundColor: '#3B82F6',
      borderColor: '#1D4ED8',
    },
    placeReserved: {
      backgroundColor: '#FFEBEE',
      borderColor: '#EF4444',
    },
    placeChauffeur: {
      backgroundColor: '#FFF3E0',
      borderColor: '#F59E0B',
    },
    placeTextAvailable: {
      color: '#22C55E',
      fontWeight: theme.typography.weights.semibold,
      fontSize: theme.typography.sizes.caption,
    },
    placeTextSelected: {
      color: '#FFFFFF',
      fontWeight: theme.typography.weights.bold,
      fontSize: theme.typography.sizes.caption,
    },
    placeTextDisabled: {
      color: '#9CA3AF',
      fontSize: theme.typography.sizes.caption,
    },

    carFooter: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },

    summary: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.weights.semibold,
    },
    summaryDivider: {
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
    selectedPlacesContainer: {
      backgroundColor: '#E3F2FD',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
    },
    selectedPlacesTitle: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary[700],
      marginBottom: theme.spacing.xs,
    },
    selectedPlacesList: {
      fontSize: theme.typography.sizes.body,
      color: theme.colors.primary[900],
      fontWeight: theme.typography.weights.bold,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral[300],
    },
    validateButton: {
      backgroundColor: theme.colors.primary[500],
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    validateButtonDisabled: {
      backgroundColor: theme.colors.neutral[400],
    },
    validateButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    modalTitle: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.secondary,
      lineHeight: 24,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalPrice: {
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
      fontSize: theme.typography.sizes.h3,
    },
    modalPlaces: {
      backgroundColor: theme.colors.background.secondary,
      padding: 12,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 16,
    },
    modalPlacesLabel: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    modalPlacesList: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[700],
    },
    modalInfo: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.tertiary,
      fontStyle: 'italic',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: theme.colors.neutral[200],
    },
    modalButtonConfirm: {
      backgroundColor: theme.colors.primary[500],
    },
    modalButtonTextCancel: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
    },
    modalButtonTextConfirm: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
    },

    // 🔹 Modal choix moyen de paiement
    paymentModalContent: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    paymentTitle: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    paymentSubtitle: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary[500],
      backgroundColor: theme.colors.primary[50],
      marginBottom: 16,
    },
    paymentOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    paymentLogo: {
      width: 40,
      height: 40,
    },
    paymentOptionTitle: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    paymentOptionSubtitle: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
    },
    paymentLaterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.neutral[300],
      backgroundColor: theme.colors.background.secondary,
    },
    paymentLaterText: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary[500],
    },
  });