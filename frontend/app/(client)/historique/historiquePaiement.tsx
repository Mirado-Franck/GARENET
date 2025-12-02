// app/(client)/historique/historiquePaiement.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { paiementService, Paiement } from '../../../services/paiementService';
import { useTheme } from '../../../contexts/ThemeContext';

export default function HistoriquePaiement() {
  const { theme } = useTheme(); // 👈 dynamique
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const router = useRouter();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
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
          flexDirection: 'row',
          alignItems: 'center',
        },
        backButton: {
          marginRight: theme.spacing.md,
        },
        headerTextContainer: {
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
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        date: {
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.secondary,
          fontWeight: theme.typography.weights.medium,
        },
        badge: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: theme.borderRadius.sm,
        },
        badgeSuccess: { backgroundColor: '#E8F5E9' },
        badgeError: { backgroundColor: '#FFEBEE' },
        badgeText: {
          fontSize: theme.typography.sizes.small,
          fontWeight: 'bold',
        },
        textSuccess: { color: theme.colors.semantic.success },
        textError: { color: theme.colors.semantic.error },
        amountContainer: {
          marginBottom: theme.spacing.sm,
        },
        amountLabel: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.secondary,
        },
        amountValue: {
          fontSize: 24,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary[600],
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.neutral[200],
          marginVertical: theme.spacing.sm,
        },
        detailsContainer: {
          marginBottom: theme.spacing.md,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 4,
        },
        detailLabel: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.secondary,
        },
        detailValue: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.primary,
          fontWeight: '600',
        },
        tripInfo: {
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
        },
        tripLabel: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.tertiary,
          marginBottom: 2,
        },
        tripRoute: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
        },
        tripCoop: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        actionsContainer: {
          marginTop: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          paddingTop: theme.spacing.md,
        },
        receiptButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          borderRadius: theme.borderRadius.sm,
          borderWidth: 1,
          borderColor: theme.colors.primary[200],
          backgroundColor: theme.colors.primary[50],
          gap: 8,
        },
        receiptButtonText: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.primary[500],
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
        },
      }),
    [theme]
  );

  useEffect(() => {
    loadPaiements();
  }, []);

  const loadPaiements = async () => {
    try {
      const data = await paiementService.getMyPaiements();
      setPaiements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async (payment: Paiement) => {
    setGeneratingId(payment.id);
    try {
      const qrData = `RECU-${payment.code_paiement}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              .invoice-box { border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; }
              .header { text-align: center; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; color: #3b82f6; text-transform: uppercase; }
              .subtitle { color: #666; font-size: 12px; margin-top: 5px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
              .label { font-weight: bold; color: #555; }
              .value { text-align: right; }
              .total-row { margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; }
              .qr-container { text-align: center; margin-top: 30px; }
              .qr-img { width: 120px; height: 120px; }
              .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <div class="title">Reçu de Paiement</div>
                <div class="subtitle">Réf: ${payment.code_paiement}</div>
              </div>
              
              <div class="row">
                <span class="label">Date</span>
                <span class="value">${new Date(payment.date_paiement).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="row">
                <span class="label">Mode</span>
                <span class="value">${payment.mode_paiement}</span>
              </div>
              <div class="row">
                <span class="label">Coopérative</span>
                <span class="value">${payment.reservation.voyage.cooperative.nom}</span>
              </div>
              <div class="row">
                <span class="label">Trajet</span>
                <span class="value">${payment.reservation.voyage.trajet.station_depart} ➝ ${payment.reservation.voyage.trajet.station_arrivee}</span>
              </div>

              <div class="total-row">
                <span>TOTAL PAYÉ</span>
                <span style="color: #3b82f6;">${payment.montant.toLocaleString()} Ar</span>
              </div>

              <div class="qr-container">
                <img src="${qrUrl}" class="qr-img" />
                <p style="font-size: 10px; margin-top: 5px;">Preuve de paiement GarNet</p>
              </div>

              <div class="footer">
                Merci pour votre confiance.
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Reçu de paiement ${payment.code_paiement}`,
        });
      } else {
        Alert.alert("Erreur", "Le partage n'est pas supporté sur cet appareil");
      }
    } catch (error) {
      console.error('❌ Erreur génération reçu:', error);
      Alert.alert('Erreur', 'Impossible de générer le reçu.');
    } finally {
      setGeneratingId(null);
    }
  };

  const renderItem = ({ item }: { item: Paiement }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {new Date(item.date_paiement).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </Text>
        <View style={[
          styles.badge,
          item.status === 'valide' ? styles.badgeSuccess : styles.badgeError
        ]}>
          <Text style={[
            styles.badgeText,
            item.status === 'valide' ? styles.textSuccess : styles.textError
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Montant</Text>
        <Text style={styles.amountValue}>{item.montant.toLocaleString()} Ar</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mode :</Text>
          <Text style={styles.detailValue}>{item.mode_paiement}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Réf :</Text>
          <Text style={styles.detailValue}>{item.code_paiement}</Text>
        </View>
      </View>

      {item.reservation?.voyage && (
        <View style={styles.tripInfo}>
          <Text style={styles.tripLabel}>Pour le voyage :</Text>
          <Text style={styles.tripRoute}>
            {item.reservation.voyage.trajet?.station_depart || 'N/A'} ➝ {item.reservation.voyage.trajet?.station_arrivee || 'N/A'}
          </Text>
          {item.reservation.voyage.cooperative?.nom && (
            <Text style={styles.tripCoop}>
              {item.reservation.voyage.cooperative.nom}
            </Text>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.receiptButton}
          onPress={() => handleGenerateReceipt(item)}
          disabled={generatingId === item.id}
        >
          {generatingId === item.id ? (
            <ActivityIndicator size="small" color={theme.colors.primary[500]} />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={18} color={theme.colors.primary[500]} />
              <Text style={styles.receiptButtonText}>Télécharger le Reçu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Historique des Paiements</Text>
          <Text style={styles.subtitle}>
            {paiements.length} {paiements.length > 1 ? 'transactions' : 'transaction'}
          </Text>
        </View>
      </View>

      {paiements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>Aucun paiement enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Vos transactions apparaîtront ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={paiements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}