// app/(client)/profil/about.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos de l'app</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo placeholder */}
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={80} color={theme.colors.primary[500]} />
          </View>

          <Text style={styles.appName}>GARENET</Text>
          <Text style={styles.version}>Version 1.0.0</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.text}>
              GARENET est une application de réservation de voyages en coopérative de transport.
              {'\n\n'}
              [Le contenu détaillé sera ajouté ultérieurement]
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fonctionnalités</Text>
            <Text style={styles.text}>
              • Réservation de voyages{'\n'}
              • Gestion des réservations{'\n'}
              • Système d'avis{'\n'}
              • Profil utilisateur{'\n'}
              • Historique des voyages
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.text}>
              Email : contact@garenet.com{'\n'}
              Téléphone : +261 XX XX XXX XX
            </Text>
          </View>

          <Text style={styles.copyright}>© 2024 GARENET. Tous droits réservés.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.sm,
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
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  version: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxxl,
  },
  section: {
    width: '100%',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  copyright: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
});