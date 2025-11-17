// app/(client)/profil/privacy.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

export default function Privacy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique et Confidentialité</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color={theme.colors.primary[500]} />
          </View>

          <Text style={styles.subtitle}>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Collecte des données</Text>
            <Text style={styles.text}>
              [Le contenu détaillé sera ajouté ultérieurement]
              {'\n\n'}
              GARENET collecte et utilise vos données personnelles conformément au RGPD.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
            <Text style={styles.text}>
              [Le contenu détaillé sera ajouté ultérieurement]
              {'\n\n'}
              Vos données sont utilisées uniquement pour améliorer nos services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Protection des données</Text>
            <Text style={styles.text}>
              [Le contenu détaillé sera ajouté ultérieurement]
              {'\n\n'}
              Nous mettons en œuvre des mesures de sécurité appropriées.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Vos droits</Text>
            <Text style={styles.text}>
              [Le contenu détaillé sera ajouté ultérieurement]
              {'\n\n'}
              • Droit d'accès{'\n'}
              • Droit de rectification{'\n'}
              • Droit à l'effacement{'\n'}
              • Droit à la portabilité
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Cookies</Text>
            <Text style={styles.text}>
              [Le contenu détaillé sera ajouté ultérieurement]
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Contact</Text>
            <Text style={styles.text}>
              Pour toute question concernant vos données :{'\n\n'}
              Email : privacy@garenet.com{'\n'}
              Adresse : [À compléter]
            </Text>
          </View>
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
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
    fontStyle: 'italic',
  },
  section: {
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
});