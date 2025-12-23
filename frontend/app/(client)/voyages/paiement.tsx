import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";
import type { Theme } from "../../../constants/theme";

type PaymentMode = "all" | "partial";

export default function Paiement() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [numeroMvola, setNumeroMvola] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);

  // Paiement échelonné
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("all");
  const [partialAmount, setPartialAmount] = useState<string>("");

  // -------- Helpers montants (total / payé / restant) ----------
  const computeNombrePlaces = (data: any): number => {
    if (typeof data?.nombre_places === "number") return data.nombre_places;
    if (Array.isArray(data?.places)) return data.places.length;
    return 0;
  };

  const computeTotal = (data: any, nombrePlaces: number): number => {
    // priorité aux champs backend si présents
    if (typeof data?.montant_total === "number") return data.montant_total;

    // sinon calcul via prix * nb places
    const prix = Number(data?.voyage?.prix);
    if (Number.isFinite(prix) && nombrePlaces > 0) return prix * nombrePlaces;

    // fallback
    return Number(data?.montant || 0);
  };

  const computeRestant = (data: any, total: number): number => {
    if (typeof data?.montant_restant === "number") return Math.max(0, data.montant_restant);

    // si on arrive depuis liste/détail, data.montant peut déjà être le restant
    if (typeof data?.montant === "number") return Math.max(0, data.montant);

    return total;
  };

  const computePaye = (data: any, total: number, restant: number): number => {
    if (typeof data?.montant_paye === "number") return Math.max(0, data.montant_paye);
    return Math.max(0, total - restant);
  };

  // -------- Confirmation abandon ----------
  const confirmAbandon = useCallback(() => {
    Alert.alert(
      "Abandonner le paiement ?",
      "Voulez-vous vraiment abandonner le paiement ? Votre réservation sera en attente.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("temp_reservation");
            } catch {}
            router.replace("/(client)/reservations/listeReservation");
          },
        },
      ]
    );
  }, [router]);

  // Intercepter le bouton retour Android
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmAbandon();
      return true; // on bloque le back par défaut
    });
    return () => sub.remove();
  }, [confirmAbandon]);

  // -------- Charger temp_reservation ----------
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
          Alert.alert("Erreur", "Aucune donnée de réservation trouvée. Veuillez recommencer.");
          router.back();
        }
      } catch (error) {
        console.error("❌ Erreur chargement données:", error);
        Alert.alert("Erreur", "Impossible de charger les données de réservation");
        router.back();
      }
    };
    loadData();
  }, [router]);

  // Pré-remplir le montant partiel par défaut quand les données arrivent
  useEffect(() => {
    if (!reservationData) return;

    const nb = computeNombrePlaces(reservationData);
    const total = computeTotal(reservationData, nb);
    const restant = computeRestant(reservationData, total);

    // Mode "all" par défaut, donc partiel vide
    setPartialAmount(String(Math.floor(restant))); // valeur par défaut si l’utilisateur passe en "partiel"
  }, [reservationData]);

  const sanitizePhone = (text: string) => text.replace(/\D/g, "").slice(0, 10);
  const sanitizeAmount = (text: string) => text.replace(/\D/g, ""); // digits only

  const handlePayment = async () => {
    if (!reservationData) {
      Alert.alert("Erreur", "Données de réservation introuvables");
      return;
    }

    // Numéro MVola : digits only + max 10
    const numeroNormalized = sanitizePhone(numeroMvola);
    if (!numeroNormalized) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro MVola");
      return;
    }

    if (!/^03[2-48]\d{7}$/.test(numeroNormalized)) {
      Alert.alert("Erreur", "Numéro MVola invalide. Exemple: 0340000000");
      return;
    }

    const nombrePlaces = computeNombrePlaces(reservationData);
    const total = computeTotal(reservationData, nombrePlaces);
    const restant = computeRestant(reservationData, total);

    if (restant <= 0) {
      Alert.alert("Info", "Cette réservation est déjà soldée.");
      return;
    }

    // Montant à payer selon le mode
    let montantToPay = restant;

    if (paymentMode === "partial") {
      const cleaned = sanitizeAmount(partialAmount);
      const partial = Number(cleaned);

      if (!cleaned || !Number.isFinite(partial) || partial <= 0) {
        Alert.alert("Erreur", "Veuillez saisir un montant partiel valide");
        return;
      }

      if (partial > restant) {
        Alert.alert("Erreur", `Le montant ne doit pas dépasser ${Math.floor(restant).toLocaleString()} Ar`);
        return;
      }

      montantToPay = partial;
    }

    setLoading(true);
    try {
      console.log("💳 Début du paiement...", {
        reservationId: reservationData.reservationId,
        numeroMvola: numeroNormalized,
        montant: montantToPay,
        paymentMode,
      });

      const response = await api.post("/paiements/process-complete", {
        reservation_id: reservationData.reservationId,
        numero_mvola: numeroNormalized,
        montant: montantToPay,
      });

      console.log("✅ Réponse paiement:", response.data);

      if (response.data.success) {
        // ✅ On garde ce que tu faisais, sans message “reçu généré”
        await AsyncStorage.setItem(
          "last_confirmation",
          JSON.stringify({
            reservationId: reservationData.reservationId,
            code_reservation: reservationData.code_reservation,
            voyage: reservationData.voyage,
            places: reservationData.places,

            // montant payé maintenant
            montant: montantToPay,

            // infos backend (si fournies)
            recu: response.data.data?.recu?.code || null,
            paiement: response.data.data?.paiement || null,
            montant_infos: response.data.data?.montant || null, // {total, deja_paye, restant} si backend l’envoie
          })
        );

        // On nettoie temp_reservation pour éviter de recharger de vieilles données
        await AsyncStorage.removeItem("temp_reservation");

        // Redirection comme avant
        router.replace("/(client)/voyages/confirmation");
      } else {
        Alert.alert("Paiement refusé", response.data.message || "Erreur de paiement");
      }
    } catch (error: any) {
      console.error("❌ Erreur paiement:", error);

      let errorMessage = "Impossible de traiter le paiement";
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;

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

  const nombrePlaces = computeNombrePlaces(reservationData);
  const total = computeTotal(reservationData, nombrePlaces);
  const restant = computeRestant(reservationData, total);
  const paye = computePaye(reservationData, total, restant);

  const prixUnitaire =
    reservationData.voyage?.prix ??
    (nombrePlaces ? total / nombrePlaces : undefined);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background.secondary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec bouton retour */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={confirmAbandon} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary[500]} />
          </TouchableOpacity>

          <View style={styles.pageHeaderIcon}>
            <Ionicons name="card-outline" size={22} color={theme.colors.primary[500]} />
          </View>

          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.title}>Paiement MVola</Text>
            <Text style={styles.subtitle}>Vérifiez les détails puis confirmez le paiement</Text>
          </View>
        </View>

        {/* RÉCAPITULATIF */}
        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconCircle}>
              <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Détails de la réservation</Text>
              <Text style={styles.sectionSubtitle}>Assurez-vous que les informations sont correctes</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Réservation</Text>
            <Text style={styles.codeValue}>{reservationData.code_reservation || "N/A"}</Text>
          </View>

          {reservationData.voyage?.cooperative?.nom && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Coopérative</Text>
              <Text style={styles.value}>{reservationData.voyage.cooperative.nom}</Text>
            </View>
          )}

          {reservationData.voyage?.trajet && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Trajet</Text>
              <Text style={styles.value}>
                {reservationData.voyage.trajet.depart} → {reservationData.voyage.trajet.arrivee}
              </Text>
            </View>
          )}

          {reservationData.voyage?.date_depart && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Date de départ</Text>
              <Text style={styles.value}>
                {new Date(reservationData.voyage.date_depart).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          )}

          {reservationData.places && Array.isArray(reservationData.places) && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Places</Text>
              <Text style={styles.value}>{reservationData.places.join(", ")}</Text>
            </View>
          )}

          {typeof nombrePlaces === "number" && nombrePlaces > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Nombre de places</Text>
              <Text style={styles.value}>{nombrePlaces}</Text>
            </View>
          )}

          {typeof prixUnitaire === "number" && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Prix unitaire</Text>
              <Text style={styles.value}>{Number(prixUnitaire).toLocaleString()} Ar</Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{total.toLocaleString()} Ar</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Déjà payé</Text>
            <Text style={styles.value}>{paye.toLocaleString()} Ar</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Reste à payer</Text>
            <Text style={styles.totalValue}>{restant.toLocaleString()} Ar</Text>
          </View>
        </View>

        {/* SECTION PAIEMENT */}
        <View style={styles.paymentSection}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconCircle}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Informations de paiement</Text>
              <Text style={styles.sectionSubtitle}>Le paiement sera débité sur votre compte MVola</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Mode de paiement</Text>
            <View style={styles.paymentTag}>
              <Ionicons name="logo-usd" size={14} color={theme.colors.primary[700]} />
              <Text style={styles.paymentTagText}>MVola</Text>
            </View>
          </View>

          {reservationData.code_reservation && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Référence paiement</Text>
              <Text style={styles.value}>{reservationData.code_reservation}</Text>
            </View>
          )}

          {/* Choix payer tout / partiel */}
          <Text style={styles.label}>Montant à payer</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                paymentMode === "all" && styles.modeBtnActive,
              ]}
              onPress={() => setPaymentMode("all")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={paymentMode === "all" ? theme.colors.text.inverse : theme.colors.primary[500]}
              />
              <Text style={[
                styles.modeBtnText,
                paymentMode === "all" && styles.modeBtnTextActive,
              ]}>
                Payer tout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                paymentMode === "partial" && styles.modeBtnActive,
              ]}
              onPress={() => setPaymentMode("partial")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={paymentMode === "partial" ? theme.colors.text.inverse : theme.colors.primary[500]}
              />
              <Text style={[
                styles.modeBtnText,
                paymentMode === "partial" && styles.modeBtnTextActive,
              ]}>
                Payer partiel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Champ montant */}
          {paymentMode === "all" ? (
            <TextInput
              style={styles.input}
              value={`${Math.floor(restant).toString()}`}
              editable={false}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder={`Max: ${Math.floor(restant).toLocaleString()} Ar`}
              keyboardType="number-pad"
              value={partialAmount}
              onChangeText={(txt) => {
                const cleaned = sanitizeAmount(txt);
                if (!cleaned) {
                  setPartialAmount("");
                  return;
                }
                const n = Number(cleaned);
                if (Number.isFinite(n) && n > restant) {
                  setPartialAmount(String(Math.floor(restant)));
                } else {
                  setPartialAmount(cleaned);
                }
              }}
              placeholderTextColor={theme.colors.neutral[400]}
            />
          )}

          <View style={styles.summaryDivider} />

          <Text style={styles.label}>Numéro MVola à débiter</Text>
          <TextInput
            style={styles.input}
            placeholder="0340000000"
            keyboardType="number-pad"
            value={numeroMvola}
            onChangeText={(txt) => setNumeroMvola(sanitizePhone(txt))}
            maxLength={10}
            autoComplete="tel"
            placeholderTextColor={theme.colors.neutral[400]}
          />

          <View style={styles.helperRow}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.tertiary} />
            <Text style={styles.helperText}>
              Numéro MVola sur 10 chiffres. Exemple: 0340000000
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
                {paymentMode === "all"
                  ? `Payer ${Math.floor(restant).toLocaleString()} Ar`
                  : `Payer ${Number(partialAmount || 0).toLocaleString()} Ar`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.securityRow}>
          <Ionicons name="lock-closed-outline" size={16} color={theme.colors.text.tertiary} />
          <Text style={styles.securityText}>
            Paiement sécurisé par MVola. Assurez-vous que votre téléphone est allumé et dispose de réseau.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },

    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary[50],
    },
    pageHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.primary[50],
      alignItems: "center",
      justifyContent: "center",
    },
    pageHeaderTextContainer: { flex: 1 },
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
    totalLabel: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      flex: 1,
    },
    totalValue: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary[500],
      textAlign: "right",
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

    modeRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    modeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary[500],
      backgroundColor: theme.colors.primary[50],
    },
    modeBtnActive: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    modeBtnText: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary[700],
    },
    modeBtnTextActive: {
      color: theme.colors.text.inverse,
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
    buttonDisabled: { backgroundColor: theme.colors.neutral[400] },
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
  });