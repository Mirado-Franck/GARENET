import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reservationService, Reservation } from '../../../services/reservationService';
import { Toast } from '../../../components/ui/Toast';
import { theme } from '../../../constants/theme';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function DetailReservation() {
  const params = useLocalSearchParams();
  const reservationId = parseInt(params.id as string);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // ✅ Modal de confirmation annulation
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadReservation();
  }, []);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const reservations = await reservationService.getMyReservations();
      const found = reservations.find(r => r.id === reservationId);
      setReservation(found || null);
    } catch (error: any) {
      console.error('Erreur chargement réservation:', error);
      setToastMessage('Impossible de charger les détails de la réservation');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
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

  const handlePrint = async () => {
    if (!reservation) return;
    
    const prixTotal = reservation.nombre_places * reservation.voyage.prix;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: #f5f5f5;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #007AFF;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #007AFF;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .section {
              margin: 25px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .section-title {
              color: #007AFF;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              border-bottom: 2px solid #007AFF;
              padding-bottom: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #666;
              font-weight: 600;
            }
            .value {
              color: #333;
              font-weight: bold;
            }
            .trajet-container {
              text-align: center;
              font-size: 20px;
              color: #333;
              margin: 20px 0;
            }
            .places-container {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 10px;
            }
            .place-chip {
              background: #007AFF;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
            }
            .total {
              background: #007AFF;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              color: #999;
              font-size: 12px;
            }
            @media print {
              body { background: white; padding: 0; }
              .receipt { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>🚌 GARENET</h1>
              <p>Reçu de Réservation</p>
            </div>

            <div class="section">
              <div class="section-title">Informations de réservation</div>
              <div class="info-row">
                <span class="label">Code de réservation</span>
                <span class="value">${reservation.code_reservation}</span>
              </div>
              <div class="info-row">
                <span class="label">Date de réservation</span>
                <span class="value">${formatDate(reservation.date_reservation)}</span>
              </div>
              <div class="info-row">
                <span class="label">Statut</span>
                <span class="value">${getStatutLabel(reservation.statut)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Trajet</div>
              <div class="trajet-container">
                ${reservation.voyage.trajet.depart}
                <br/>
                ⬇️ ${reservation.voyage.trajet.distance} km
                <br/>
                ${reservation.voyage.trajet.arrivee}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Détails du voyage</div>
              <div class="info-row">
                <span class="label">Date de départ</span>
                <span class="value">${formatDate(reservation.voyage.date_depart)}</span>
              </div>
              <div class="info-row">
                <span class="label">Heure de départ</span>
                <span class="value">${formatHeure(reservation.voyage.heure_depart)}</span>
              </div>
              <div class="info-row">
                <span class="label">Coopérative</span>
                <span class="value">${reservation.voyage.cooperative.nom}</span>
              </div>
              <div class="info-row">
                <span class="label">Véhicule</span>
                <span class="value">${reservation.voyage.voiture.modele} - ${reservation.voyage.voiture.immatriculation}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Places réservées</div>
              <div class="places-container">
                ${reservation.places.map(place => `<span class="place-chip">${place}</span>`).join('')}
              </div>
              <div class="info-row" style="margin-top: 20px;">
                <span class="label">Nombre de places</span>
                <span class="value">${reservation.nombre_places}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Tarification</div>
              <div class="info-row">
                <span class="label">Prix unitaire</span>
                <span class="value">${reservation.voyage.prix.toLocaleString()} Ar</span>
              </div>
              <div class="info-row">
                <span class="label">Nombre de places</span>
                <span class="value">× ${reservation.nombre_places}</span>
              </div>
            </div>

            <div class="total">
              TOTAL : ${prixTotal.toLocaleString()} Ar
            </div>

            <div class="footer">
              <p>Merci d'avoir choisi GARENET pour votre voyage</p>
              <p>Pour toute question, contactez-nous</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
if (Platform.OS === 'web') {
  // ✅ Méthode iframe (plus fiable pour l'impression)
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Nettoyer l'iframe après impression
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
  
  return;
}else {
        // ✅ Version Mobile : Utiliser expo-print
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
        
        setToastMessage('Reçu généré avec succès');
        setToastType('success');
        setToastVisible(true);
      }
    } catch (error) {
      console.error('Erreur impression:', error);
      setToastMessage('Erreur lors de la génération du reçu');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: any = {
      confirmee: 'Confirmée',
      en_attente: 'En attente',
      annulee: 'Annulée',
    };
    return labels[statut] || statut;
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
        <Ionicons name={config.icon as any} size={20} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
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
        <Text style={styles.errorText}>Réservation introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prixTotal = reservation.nombre_places * reservation.voyage.prix;

  return (
    <View style={styles.container}>
      {/* ✅ Header fixe (ne scroll pas) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la réservation</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ✅ Contenu scrollable */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Code et Statut */}
          <View style={styles.topCard}>
            <Text style={styles.codeReservation}>{reservation.code_reservation}</Text>
            <Text style={styles.dateReservation}>
              Réservé le {formatDate(reservation.date_reservation)}
            </Text>
            <View style={styles.statusContainer}>
              {getStatusBadge(reservation.statut)}
            </View>
          </View>

          {/* Trajet */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trajet</Text>
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

          {/* Informations voyage */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations du voyage</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vos places</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tarification</Text>
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
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{prixTotal.toLocaleString()} Ar</Text>
            </View>
          </View>

          {/* Coopérative */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Coopérative</Text>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.infoValue}>{reservation.voyage.cooperative.nom}</Text>
            </View>
          </View>

          {/* Véhicule */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Véhicule</Text>
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

          {/* Espace pour éviter que le contenu soit caché par le footer */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ✅ Boutons fixes en bas */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={styles.printButtonText}>Imprimer le reçu</Text>
        </TouchableOpacity>

        {reservation.statut === 'confirmee' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReservation}>
            <Ionicons name="close-circle-outline" size={20} color={theme.colors.semantic.error} />
            <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ Modal de confirmation annulation */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={60} color={theme.colors.semantic.error} />
            
            <Text style={styles.modalTitle}>Annuler la réservation</Text>
            
            <Text style={styles.modalMessage}>
              Voulez-vous vraiment annuler la réservation{' '}
              <Text style={styles.modalCode}>{reservation.code_reservation}</Text> ?
            </Text>
            
            <Text style={styles.modalWarning}>
              ⚠️ Cette action est irréversible
            </Text>

            {/* Fenetre de confirmation */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Non, garder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={performCancellation}
              >
                <Text style={styles.modalButtonTextConfirm}>Oui, annuler</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>

      {/* Toast */}
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
  content: {
    padding: theme.spacing.lg,
  },
  topCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
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
  statusContainer: {
    marginTop: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.round,
    borderWidth: 2,
  },
  statusText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
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
  cardTitle: {
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
    borderRadius: theme.borderRadius.round,
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
    gap: theme.spacing.sm,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  printButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.semantic.error + '10',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.semantic.error,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.semantic.error,
  },
  // Modal styles
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
    alignItems: 'center',
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
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCode: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
  modalWarning: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.semantic.error,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
    backgroundColor: theme.colors.semantic.error,
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
});