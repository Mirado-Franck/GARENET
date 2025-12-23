// frontend/app/(client)/voyages/confirmation.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "../../../contexts/ThemeContext";

export default function Confirmation() {
  const router = useRouter();
  const { theme } = useTheme();
  const [data, setData] = useState<any>(null);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background.secondary,
        },
        successIcon: {
          marginBottom: theme.spacing.lg,
        },
        icon: {
          fontSize: 80,
          color: theme.colors.semantic.success,
        },
        title: {
          fontSize: theme.typography.sizes.h2,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xl,
          textAlign: "center",
        },
        loadingText: {
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.secondary,
        },
        card: {
          width: "100%",
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
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
        detailRow: {
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
        valueSmall: {
          fontSize: theme.typography.sizes.small,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.tertiary,
          flex: 1,
          textAlign: "right",
        },
        divider: {
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
          color: theme.colors.semantic.success,
        },
        infoBox: {
          backgroundColor: theme.colors.primary[50],
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
          marginBottom: theme.spacing.lg,
          width: "100%",
        },
        infoText: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.primary[700],
          textAlign: "center",
        },
        buttons: {
          width: "100%",
          gap: theme.spacing.md,
        },
        button: {
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          alignItems: "center",
        },
        primaryButton: {
          backgroundColor: theme.colors.primary[500],
        },
        secondaryButton: {
          backgroundColor: theme.colors.neutral[200],
        },
        buttonText: {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.body,
        },
        buttonTextSecondary: {
          color: theme.colors.text.secondary,
          fontWeight: theme.typography.weights.semibold,
          fontSize: theme.typography.sizes.body,
        },
      }),
    [theme]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const temp = await AsyncStorage.getItem("last_confirmation");
        if (temp) {
          const parsedData = JSON.parse(temp);
          setData(parsedData);
        }
      } catch (error) {
        console.error("❌ Erreur chargement confirmation:", error);
      }
    };
    loadData();
  }, []);

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement de la confirmation...</Text>
      </View>
    );
  }

  const voyageInfo = data.voyage
    ? `${data.voyage.trajet?.depart || ""} → ${data.voyage.trajet?.arrivee || ""}`
    : "Voyage inconnu";

  const dateVoyage = data.voyage?.date_depart
    ? new Date(data.voyage.date_depart).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.icon}>✅</Text>
      </View>

      <Text style={styles.title}>Paiement réussi !</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Détails de votre réservation</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Réservation :</Text>
          <Text style={styles.value}>{data.code_reservation || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Trajet :</Text>
          <Text style={styles.value}>{voyageInfo}</Text>
        </View>

        {dateVoyage && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date :</Text>
            <Text style={styles.value}>{dateVoyage}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Places :</Text>
          <Text style={styles.value}>
            {Array.isArray(data.places) ? data.places.join(", ") : "N/A"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.totalLabel}>Montant payé :</Text>
          <Text style={styles.totalValue}>{(data.montant || 0).toLocaleString()} Ar</Text>
        </View>

        {data.paiement?.code && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Code paiement :</Text>
            <Text style={styles.valueSmall}>{data.paiement.code}</Text>
          </View>
        )}

        {data.recu && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Reçu :</Text>
            <Text style={styles.valueSmall}>{data.recu}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Etape complète! Vous pouvez le retrouver dans vos réservations.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => {
            AsyncStorage.removeItem("last_confirmation");
            router.replace("/(client)/reservations/listeReservation");
          }}
        >
          <Text style={styles.buttonText}>Voir mes réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            AsyncStorage.removeItem("last_confirmation");
            router.replace("/(client)/voyages/listeCooperative");
          }}
        >
          <Text style={styles.buttonTextSecondary}>Retour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}