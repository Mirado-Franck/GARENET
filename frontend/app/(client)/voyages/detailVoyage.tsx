// app/(client)/voyages/detailVoyage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { voyageService, Voyage } from '../../../services/voyageService';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';

export default function DetailVoyage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { utilisateur, isConnecte } = useAuth();
  const { theme } = useTheme(); // 👈 dynamique

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.secondary,
        },
        centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        },
        header: {
          backgroundColor: theme.colors.primary[500],
          paddingTop: 50,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
        },
        backButton: {
          marginRight: theme.spacing.lg,
        },
        headerTitle: {
          fontSize: theme.typography.sizes.h2,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.inverse,
        },
        content: {
          flex: 1,
          padding: theme.spacing.lg,
        },
        trajetCard: {
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg,
          ...theme.shadows.md,
        },
        trajetHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        locationContainer: {
          flex: 1,
          alignItems: 'center',
        },
        locationText: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
          marginTop: theme.spacing.xs,
          textAlign: 'center',
        },
        distanceContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[300],
        },
        distanceText: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.text.secondary,
          marginLeft: theme.spacing.sm,
        },
        infoCard: {
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          ...theme.shadows.sm,
        },
        sectionTitle: {
          fontSize: theme.typography.sizes.h3,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary[500],
          marginBottom: theme.spacing.md,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        infoLabel: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.text.secondary,
          marginLeft: theme.spacing.sm,
          marginRight: theme.spacing.sm,
        },
        infoValue: {
          fontSize: theme.typography.sizes.caption,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
          flex: 1,
        },
        prixValue: {
          fontSize: theme.typography.sizes.h3,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary[500],
          flex: 1,
        },
        statusBadge: {
          backgroundColor: '#E8F5E9',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.round,
          alignSelf: 'flex-start',
          marginTop: theme.spacing.sm,
        },
        statusText: {
          fontSize: theme.typography.sizes.caption,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.semantic.success,
        },
        cooperativeInfo: {
          gap: theme.spacing.sm,
        },
        cooperativeName: {
          fontSize: theme.typography.sizes.h3,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary[500],
          marginBottom: theme.spacing.sm,
        },
        cooperativeContact: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.text.primary,
          marginLeft: theme.spacing.sm,
        },
        cooperativeAddress: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.text.secondary,
          marginLeft: theme.spacing.sm,
        },
        vehiculeInfo: {
          gap: theme.spacing.sm,
        },
        chauffeurInfo: {
          gap: theme.spacing.sm,
        },
        chauffeurName: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
          marginLeft: theme.spacing.sm,
        },
        userInfo: {
          backgroundColor: '#E8F5E9',
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
          marginBottom: theme.spacing.lg,
        },
        userInfoText: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.semantic.success,
          textAlign: 'center',
        },
        footer: {
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[300],
        },
        loadingText: {
          marginTop: theme.spacing.md,
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.secondary,
        },
        errorText: {
          fontSize: theme.typography.sizes.body,
          color: theme.colors.semantic.error,
          textAlign: 'center',
          marginVertical: theme.spacing.lg,
        },
        retryButton: {
          backgroundColor: theme.colors.primary[500],
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          marginTop: theme.spacing.lg,
        },
        retryText: {
          color: theme.colors.text.inverse,
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
        },
      }),
    [theme]
  );

  useEffect(() => {
    if (id) {
      loadVoyageDetail();
    }
  }, [id]);

  const loadVoyageDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voyageService.getVoyageById(Number(id));
      setVoyage(data);
    } catch (err: any) {
      setError('Impossible de charger les détails du voyage');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserver = () => {
    if (!voyage) {
      Alert.alert('Erreur', 'Informations du voyage indisponibles');
      return;
    }

    if (!isConnecte) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour réserver un voyage',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/se-connecter') },
        ]
      );
      return;
    }

    router.push({
      pathname: '/(client)/voyages/reservation',
      params: {
        voyageId: id,
        prix: voyage.prix.toString(),
      },
    });
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !voyage) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>{error || 'Voyage introuvable'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVoyageDetail}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du voyage</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Trajet principal */}
        <View style={styles.trajetCard}>
          <View style={styles.trajetHeader}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color={theme.colors.primary[500]} />
              <Text style={styles.locationText}>{voyage.trajet.station_depart}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={theme.colors.text.secondary} />
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color={theme.colors.semantic.error} />
              <Text style={styles.locationText}>{voyage.trajet.station_arrivee}</Text>
            </View>
          </View>

          <View style={styles.distanceContainer}>
            <Ionicons name="map-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.distanceText}>
              Distance : {voyage.trajet.distance} km
            </Text>
          </View>
        </View>

        {/* Infos voyage */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations du voyage</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Date de départ :</Text>
            <Text style={styles.infoValue}>{formatDate(voyage.date_depart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Heure de départ :</Text>
            <Text style={styles.infoValue}>{formatHeure(voyage.heure_depart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Prix :</Text>
            <Text style={styles.prixValue}>{voyage.prix.toLocaleString()} Ar</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.infoLabel}>Places disponibles :</Text>
            <Text style={styles.infoValue}>
              {(voyage as any).placesDisponibles || voyage.voiture.capacite} / {voyage.voiture.capacite}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {voyage.status === 'disponible' ? '✓ Disponible' : 'Complet'}
            </Text>
          </View>
        </View>

        {/* Coopérative */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Coopérative</Text>
          <View style={styles.cooperativeInfo}>
            <Text style={styles.cooperativeName}>{voyage.cooperative.nom}</Text>
            {voyage.cooperative.contact && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={18} color={theme.colors.primary[500]} />
                <Text style={styles.cooperativeContact}>{voyage.cooperative.contact}</Text>
              </View>
            )}
            {voyage.cooperative.adresse && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary[500]} />
                <Text style={styles.cooperativeAddress}>{voyage.cooperative.adresse}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Véhicule */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Véhicule</Text>
          <View style={styles.vehiculeInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.infoLabel}>Modèle :</Text>
              <Text style={styles.infoValue}>{voyage.voiture.modele}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.infoLabel}>Immatriculation :</Text>
              <Text style={styles.infoValue}>{voyage.voiture.immatriculation}</Text>
            </View>
          </View>
        </View>

        {/* Chauffeur */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Chauffeur</Text>
          <View style={styles.chauffeurInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.chauffeurName}>{voyage.chauffeur.nom}</Text>
            </View>
          </View>
        </View>

        {/* Utilisateur connecté */}
        {isConnecte && utilisateur && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Connecté en tant que : {utilisateur.nom}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bouton de réservation */}
      <View style={styles.footer}>
        <Button
          title={`Réserver - ${voyage.prix.toLocaleString()} Ar/place`}
          onPress={handleReserver}
          variant="primary"
          disabled={voyage.status !== 'disponible'}
        />
      </View>
    </View>
  );
}