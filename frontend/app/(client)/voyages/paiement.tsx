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
import { api } from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";
import type { Theme } from "../../../constants/theme";

export default function Paiement() {
  const router = useRouter();
  const { theme } = useTheme();                                   // 👈 Thème dynamique
  const styles = React.useMemo(() => createStyles(theme), [theme]); // 👈 Styles dynamiques

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

    // Normalisation + validation du numéro MVola
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

  // Écran de chargement si les données ne sont pas encore là
  if (!reservationData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  // 🔢 Données calculées pour le récapitulatif
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
      <Text style={styles.title}>Paiement MVola</Text>

      {/* RÉCAPITULATIF RÉSERVATION + PRIX */}
      <View style={styles.summary}>
        <Text style={styles.sectionTitle}>Détails de la réservation</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Réservation :</Text>
          <Text style={styles.value}>
            {reservationData.code_reservation || "N/A"}
          </Text>
        </View>

        {reservationData.voyage?.cooperative?.nom && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Coopérative :</Text>
            <Text style={styles.value}>
              {reservationData.voyage.cooperative.nom}
            </Text>
          </View>
        )}

        {reservationData.voyage?.trajet && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Trajet :</Text>
            <Text style={styles.value}>
              {reservationData.voyage.trajet.depart} →{" "}
              {reservationData.voyage.trajet.arrivee}
            </Text>
          </View>
        )}

        {reservationData.voyage?.date_depart && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Date de départ :</Text>
            <Text style={styles.value}>
              {new Date(
                reservationData.voyage.date_depart
              ).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        )}

        {reservationData.places && Array.isArray(reservationData.places) && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Places :</Text>
            <Text style={styles.value}>
              {reservationData.places.join(", ")}
            </Text>
          </View>
        )}

        {typeof nombrePlaces === "number" && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Nombre de places :</Text>
            <Text style={styles.value}>{nombrePlaces}</Text>
          </View>
        )}

        {typeof prixUnitaire === "number" && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Prix unitaire :</Text>
            <Text style={styles.value}>
              {Number(prixUnitaire).toLocaleString()} Ar
            </Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Montant total :</Text>
          <Text style={styles.totalValue}>
            {montant.toLocaleString()} Ar
          </Text>
        </View>
      </View>

      {/* INFOS PAIEMENT (MONTANT, RÉFÉRENCE, N° MVOLA) */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Informations de paiement</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Mode de paiement :</Text>
          <Text style={styles.value}>MVola</Text>
        </View>

        {reservationData.code_reservation && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Référence paiement :</Text>
            <Text style={styles.value}>
              {reservationData.code_reservation}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Montant à payer :</Text>
          <Text style={styles.value}>
            {montant.toLocaleString()} Ar
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <Text style={styles.label}>Numéro MVola à débiter :</Text>
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

        <Text style={styles.helperText}>
          Format: 034, 033, 032 ou 038 suivi de 7 chiffres. Le numéro doit
          être au nom du titulaire du compte.
        </Text>
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
          <Text style={styles.buttonText}>
            Payer {montant.toLocaleString()} Ar
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.securityText}>
        🔒 Paiement sécurisé par MVola. Assurez-vous que votre téléphone est
        allumé et dispose de réseau.
      </Text>
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
    title: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.lg,
      color: theme.colors.text.primary,
      textAlign: "center",
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
    sectionTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
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
    summaryDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral[300],
      marginVertical: theme.spacing.md,
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
    helperText: {
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
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
    },
    securityText: {
      textAlign: "center",
      fontSize: theme.typography.sizes.small,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.sm,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
  });