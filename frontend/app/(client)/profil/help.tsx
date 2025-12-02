// app/(client)/profil/help.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Help() {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
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
        },
        iconContainer: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.colors.secondary[50],
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: theme.spacing.lg,
        },
        subtitle: {
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.xxxl,
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
        contactItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral[200],
        },
        contactIconContainer: {
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.md,
        },
        contactInfo: {
          flex: 1,
        },
        contactLabel: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.secondary,
          marginBottom: 2,
        },
        contactValue: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
        },
      }),
    [theme]
  );

  const handleEmail = () => {
    Linking.openURL('mailto:support@garenet.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+261XXXXXXXXX');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/261XXXXXXXXX');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Contact</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={60} color={theme.colors.secondary[500]} />
          </View>

          <Text style={styles.subtitle}>
            Nous sommes là pour vous aider !
          </Text>

          {/* Moyens de contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contactez-nous</Text>

            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail" size={24} color={theme.colors.primary[500]} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@garenet.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="call" size={24} color={theme.colors.semantic.success} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Téléphone</Text>
                <Text style={styles.contactValue}>+261 XX XX XXX XX</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>Discuter avec nous</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions fréquentes</Text>
            <Text style={styles.text}>
              [Le contenu FAQ sera ajouté ultérieurement]
              {'\n\n'}
              • Comment réserver un voyage ?{'\n'}
              • Comment annuler une réservation ?{'\n'}
              • Comment modifier mon profil ?{'\n'}
              • Modes de paiement acceptés{'\n'}
              • Politique de remboursement
            </Text>
          </View>

          {/* Horaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horaires d'assistance</Text>
            <Text style={styles.text}>
              Lundi - Vendredi : 8h00 - 18h00{'\n'}
              Samedi : 9h00 - 13h00{'\n'}
              Dimanche : Fermé
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}