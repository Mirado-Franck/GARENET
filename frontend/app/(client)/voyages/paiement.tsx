import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";
import type { Theme } from "../../../constants/theme";

export default function Paiement() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [numeroMvola, setNumeroMvola] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const temp = await AsyncStorage.getItem("temp_reservation");
        console.log("📦 Données récupérées depuis AsyncStorage:", temp);

        if (temp) {
          const parsedData = JSON.parse(temp);
          setReservationData(parsedData);
          console.log("✅ Données réservation chargées:", parsedData);
        } else {
          console.log("❌ Aucune donnée de réservation trouvée");
          Alert.alert(
            "Erreur",
            "Aucune donnée de réservation trouvée. Veuillez recommencer."
          );
          router.back();
        }
      } catch (error) {
        console.error("❌ Erreur chargement données:", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger les données de réservation"
        );
        router.back();
      }
    };
    loadData();
  }, []);

  const handlePayment = async () => {
    if (!numeroMvola) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro MVola");
      return;
    }

    if (!reservationData) {
      Alert.alert("Erreur", "Données de réservation introuvables");
      return;
    }

    const numeroNormalized = numeroMvola.replace(/[\s-]/g, "");
    if (!/^03[2-48]\d{7}$/.test(numeroNormalized)) {
      Alert.alert(
        "Erreur",
        "Numéro MVola invalide. Format attendu: 034 XX XXX XX"
      );
      return;
    }

    setLoading(true);
    try {
      console.log("💳 Début du paiement...", {
        reservationId: reservationData.reservationId,
        numeroMvola: numeroNormalized,
        montant: reservationData.montant,
      });

      const response = await api.post("/paiements/process-complete", {
        reservation_id: reservationData.reservationId,
        numero_mvola: numeroNormalized,
        montant: reservationData.montant,
      });

      console.log("✅ Réponse paiement:", response.data);

      if (response.data.success) {
        await AsyncStorage.setItem(
          "last_confirmation",
          JSON.stringify({
            reservationId: reservationData.reservationId,
            code_reservation: reservationData.code_reservation,
            voyage: reservationData.voyage,
            places: reservationData.places,
            montant: reservationData.montant,
            recu: response.data.data?.recu?.code || null,
            paiement: response.data.data?.paiement || null,
          })
        );

        await AsyncStorage.removeItem("temp_reservation");

        console.log("🔄 Redirection vers confirmation...");
        router.replace("/(client)/voyages/confirmation");
      } else {
        Alert.alert(
          "Paiement refusé",
          response.data.message || "Erreur de paiement"
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur paiement:", error);

      let errorMessage = "Impossible de traiter le paiement";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!reservationData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  const montant = Number(reservationData.montant || 0);
  const nombrePlaces =
    reservationData.nombre_places ??
    (Array.isArray(reservationData.places)
      ? reservationData.places.length
      : undefined);
  const prixUnitaire =
    reservationData.voyage?.prix ??
    (nombrePlaces ? montant / nombrePlaces : undefined);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Petit header visuel */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderIcon}>
          <Ionicons
            name="card-outline"
            size={22}
            color={theme.colors.primary[500]}
          />
        </View>
        <View style={styles.pageHeaderTextContainer}>
          <Text style={styles.title}>Paiement MVola</Text>
          <Text style={styles.subtitle}>
            Vérifiez les détails puis confirmez le paiement
          </Text>
        </View>
      </View>

      {/* RÉCAPITULATIF RÉSERVATION + PRIX */}
      <View style={styles.summary}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIconCircle}>
            <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Détails de la réservation</Text>
            <Text style={styles.sectionSubtitle}>
              Assurez-vous que les informations sont correctes
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Réservation</Text>
          <Text style={styles.codeValue}>
            {reservationData.code_reservation || "N/A"}
          </Text>
        </View>

        {reservationData.voyage?.cooperative?.nom && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Coopérative</Text>
            <Text style={styles.value}>
              {reservationData.voyage.cooperative.nom}
            </Text>
          </View>
        )}

        {reservationData.voyage?.trajet && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Trajet</Text>
            <Text style={styles.value}>
              {reservationData.voyage.trajet.depart} →{" "}
              {reservationData.voyage.trajet.arrivee}
            </Text>
          </View>
        )}

        {reservationData.voyage?.date_depart && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Date de départ</Text>
            <Text style={styles.value}>
              {new Date(
                reservationData.voyage.date_depart
              ).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        )}

        {reservationData.places && Array.isArray(reservationData.places) && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Places</Text>
            <Text style={styles.value}>
              {reservationData.places.join(", ")}
            </Text>
          </View>
        )}

        {typeof nombrePlaces === "number" && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Nombre de places</Text>
            <Text style={styles.value}>{nombrePlaces}</Text>
          </View>
        )}

        {typeof prixUnitaire === "number" && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Prix unitaire</Text>
            <Text style={styles.value}>
              {Number(prixUnitaire).toLocaleString()} Ar
            </Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={[styles.summaryRow, styles.totalRow]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="cash-outline"
              size={18}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.totalLabel}>Montant total</Text>
          </View>
          <Text style={styles.totalValue}>
            {montant.toLocaleString()} Ar
          </Text>
        </View>
      </View>

      {/* INFOS PAIEMENT (MONTANT, RÉFÉRENCE, N° MVOLA) */}
      <View style={styles.paymentSection}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIconCircle}>
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Informations de paiement</Text>
            <Text style={styles.sectionSubtitle}>
              Le paiement sera débité sur votre compte MVola
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Mode de paiement</Text>
          <View style={styles.paymentTag}>
            <Ionicons
              name="logo-usd"
              size={14}
              color={theme.colors.primary[700]}
            />
            <Text style={styles.paymentTagText}>MVola</Text>
          </View>
        </View>

        {reservationData.code_reservation && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Référence paiement</Text>
            <Text style={styles.value}>
              {reservationData.code_reservation}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Montant à payer</Text>
          <Text style={styles.value}>
            {montant.toLocaleString()} Ar
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <Text style={styles.label}>Numéro MVola à débiter</Text>
        <TextInput
          style={styles.input}
          placeholder="034 XX XXX XX"
          keyboardType="phone-pad"
          value={numeroMvola}
          onChangeText={setNumeroMvola}
          maxLength={13}
          autoComplete="tel"
          placeholderTextColor={theme.colors.neutral[400]}
        />

        <View style={styles.helperRow}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.helperText}>
            Format: 034, 033, 032 ou 038 suivi de 7 chiffres. Le numéro doit
            être au nom du titulaire du compte.
          </Text>
        </View>
      </View>

      {/* BOUTON PAYER */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text.inverse} />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text.inverse} />
            <Text style={styles.buttonText}>
              Payer {montant.toLocaleString()} Ar
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.securityRow}>
        <Ionicons
          name="lock-closed-outline"
          size={16}
          color={theme.colors.text.tertiary}
        />
        <Text style={styles.securityText}>
          Paiement sécurisé par MVola. Assurez-vous que votre téléphone est
          allumé et dispose de réseau.
        </Text>
      </View>
    </ScrollView>
  );
}

// ✅ Styles dépendants du thème dynamique
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.xl,
    },
    // Petit header de page
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    pageHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.primary[50],
      alignItems: "center",
      justifyContent: "center",
    },
    pageHeaderTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    subtitle: {
      marginTop: 2,
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
    },

    summary: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    paymentSection: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    // En-tête dans chaque carte
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    summaryIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary[50],
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    sectionSubtitle: {
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    value: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      flex: 1,
      textAlign: "right",
    },
    codeValue: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[600],
      flex: 1,
      textAlign: "right",
    },
    summaryDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral[300],
      marginVertical: theme.spacing.md,
    },
    totalRow: {
      marginTop: theme.spacing.xs,
    },
    totalLabel: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    totalValue: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
    },

    paymentTag: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 6,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.primary[50],
    },
    paymentTagText: {
      fontSize: theme.typography.sizes.small,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary[700],
    },

    input: {
      borderWidth: 1,
      borderColor: theme.colors.neutral[400],
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.primary,
    },
    helperRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginTop: 4,
    },
    helperText: {
      flex: 1,
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.tertiary,
      fontStyle: "italic",
    },

    button: {
      backgroundColor: theme.colors.primary[500],
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
      marginBottom: theme.spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.neutral[400],
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
    },
    securityRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 6,
      marginTop: theme.spacing.sm,
    },
    securityText: {
      textAlign: "left",
      flex: 1,
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.tertiary,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
  });