import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { voyageService, PlacesVoyageResponse, Place } from '../../../services/voyageService';
import { reservationService } from '../../../services/reservationService';
import { Toast } from '../../../components/ui/Toast';
import { theme } from '../../../constants/theme';

export default function Reservation() {
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

  const handleValidate = async () => {
    if (selectedPlaces.length === 0) {
      Alert.alert('Attention', 'Veuillez sélectionner au moins une place');
      return;
    }

    Alert.alert(
      'Confirmer la réservation',
      `Vous allez réserver ${selectedPlaces.length} place(s) pour un total de ${prixTotal.toLocaleString()} Ar.\n\nPlaces : ${selectedPlaces.join(', ')}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: confirmReservation,
        },
      ]
    );
  };

  const confirmReservation = async () => {
    try {
      setSubmitting(true);
      const response = await reservationService.createReservation({
        code_voyage_id: voyageId,
        places: selectedPlaces,
      });

      setToastMessage('Réservation confirmée avec succès !');
      setToastType('success');
      setToastVisible(true);

      setTimeout(() => {
        router.replace('/(client)/mesReservations');
      }, 2000);
    } catch (error: any) {
      console.error('Erreur réservation:', error);
      setToastMessage(error.error || 'Erreur lors de la réservation');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const prixTotal = selectedPlaces.length * prixUnitaire;

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

  // Fonction pour organiser les places en disposition de bus
  const organizeBusLayout = (places: Place[]) => {
    const chauffeur = places.find(place => place.est_chauffeur);
    const voyageurs = places.filter(place => !place.est_chauffeur);
    
    // Disposition typique d'un bus : 2 colonnes de chaque côté + allée au milieu
    const rows = [];
    
    // Première ligne : seulement le chauffeur
    if (chauffeur) {
      rows.push([chauffeur]);
    }
    
    // Organiser les places voyageurs en rangées de 4 places (2 de chaque côté)
    for (let i = 0; i < voyageurs.length; i += 4) {
      const row = voyageurs.slice(i, i + 4);
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

  const busLayout = organizeBusLayout(placesData.places);

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

        {/* Disposition du bus */}
        <View style={styles.busContainer}>
          <View style={styles.busHeader}>
            <Text style={styles.busDirection}>⬆️ Avant</Text>
          </View>
          
          {/* Volant */}
          <View style={styles.steeringWheelContainer}>
            <Text style={styles.steeringWheel}>🚗</Text>
          </View>

          {/* Grille de places organisée */}
          <View style={styles.busLayout}>
            {busLayout.map((row, rowIndex) => (
              <View key={rowIndex} style={[
                styles.busRow,
                rowIndex === 0 && styles.chauffeurRow // Première ligne pour le chauffeur
              ]}>
                {row.map((place: Place) => (
                  <TouchableOpacity
                    key={place.numero}
                    style={[
                      styles.place,
                      getPlaceStyle(place),
                      rowIndex === 0 && styles.chauffeurPlace // Style spécial pour le chauffeur
                    ]}
                    onPress={() => togglePlace(place.numero, place)}
                    disabled={!place.selectionnable || submitting}
                    activeOpacity={0.7}
                  >
                    <Text style={getPlaceTextStyle(place)}>
                      {place.numero}
                      {rowIndex === 0 && " 🪑"}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* Allée visuelle pour les rangées de voyageurs */}
                {rowIndex > 0 && row.length > 2 && (
                  <View style={styles.aisle} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.busFooter}>
            <Text style={styles.busDirection}>⬇️ Arrière</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Places sélectionnées :</Text>
            <Text style={styles.summaryValue}>
              {selectedPlaces.length} {selectedPlaces.length > 1 ? 'places' : 'place'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Prix unitaire :</Text>
            <Text style={styles.summaryValue}>{prixUnitaire.toLocaleString()} Ar</Text>
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
            <Text style={styles.selectedPlacesList}>{selectedPlaces.join(', ')}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.validateButton,
            (selectedPlaces.length === 0 || submitting) && styles.validateButtonDisabled,
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
  // Styles pour la disposition du bus
  busContainer: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  busHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  busDirection: {
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
  busLayout: {
    alignItems: 'center',
  },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  chauffeurRow: {
    marginBottom: theme.spacing.xl,
  },
  aisle: {
    width: 40,
    height: 60,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.sm,
  },
  busFooter: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  place: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
  },
  chauffeurPlace: {
    width: 80,
    height: 60,
  },
  placeAvailable: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.semantic.success,
  },
  placeSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[700],
  },
  placeReserved: {
    backgroundColor: '#FFEBEE',
    borderColor: theme.colors.semantic.error,
  },
  placeChauffeur: {
    backgroundColor: '#FFF3E0',
    borderColor: theme.colors.semantic.warning,
  },
  placeTextAvailable: {
    color: theme.colors.semantic.success,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.caption,
  },
  placeTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.caption,
  },
  placeTextDisabled: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.caption,
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
});