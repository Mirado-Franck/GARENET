import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';

export default function VoirHistorique() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Mon Historique</Text>
      <Text style={styles.subtitle}>Que souhaitez-vous consulter ?</Text>

      <View style={styles.menuContainer}>
        
        {/* 🚌 BOUTON 1 : HISTORIQUE VOYAGES */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(client)/historique/listeVoyage')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚌</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Historique des Voyages</Text>
            <Text style={styles.cardDescription}>
              Vos voyages passés et avis donnés.
            </Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>

        {/* 💳 BOUTON 2 : HISTORIQUE PAIEMENTS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(client)/historique/historiquePaiement')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, styles.iconPayment]}>
            <Text style={styles.icon}>💳</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Historique des Paiements</Text>
            <Text style={styles.cardDescription}>
              Transactions MVola et reçus.
            </Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center', // ✅ Centrer verticalement
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center', // ✅ Centrer le titre
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center', // ✅ Centrer le sous-titre
  },
  menuContainer: {
    gap: theme.spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconPayment: {
    backgroundColor: '#FFF3E0',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.text.tertiary,
  },
});