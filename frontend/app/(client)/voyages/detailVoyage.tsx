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

export default function DetailVoyage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { utilisateur, isConnecte } = useAuth();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!isConnecte) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour réserver un voyage',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Se connecter',
            onPress: () => router.push('/se-connecter'),
          },
        ]
      );
      return;
    }

    // Rediriger vers la page de réservation
    router.push(`/(client)/voyages/reservation?voyageId=${id}`);
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
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !voyage) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
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
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du voyage</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Trajet principal */}
        <View style={styles.trajetCard}>
          <View style={styles.trajetHeader}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color="#4CAF50" />
              <Text style={styles.locationText}>{voyage.trajet.station_depart}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#666" />
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color="#e74c3c" />
              <Text style={styles.locationText}>{voyage.trajet.station_arrivee}</Text>
            </View>
          </View>

          <View style={styles.distanceContainer}>
            <Ionicons name="map-outline" size={16} color="#666" />
            <Text style={styles.distanceText}>
              Distance : {voyage.trajet.distance} km
            </Text>
          </View>
        </View>

        {/* Informations du voyage */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations du voyage</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4CAF50" />
            <Text style={styles.infoLabel}>Date de départ :</Text>
            <Text style={styles.infoValue}>{formatDate(voyage.date_depart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#4CAF50" />
            <Text style={styles.infoLabel}>Heure de départ :</Text>
            <Text style={styles.infoValue}>{formatHeure(voyage.heure_depart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.infoLabel}>Prix :</Text>
            <Text style={styles.prixValue}>{voyage.prix.toLocaleString()} Ar</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color="#4CAF50" />
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
                <Ionicons name="call" size={18} color="#4CAF50" />
                <Text style={styles.cooperativeContact}>{voyage.cooperative.contact}</Text>
              </View>
            )}
            {voyage.cooperative.adresse && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#4CAF50" />
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
              <Ionicons name="car" size={20} color="#4CAF50" />
              <Text style={styles.infoLabel}>Modèle :</Text>
              <Text style={styles.infoValue}>{voyage.voiture.modele}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#4CAF50" />
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
              <Ionicons name="person" size={20} color="#4CAF50" />
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

      {/* Bouton de réservation fixe en bas */}
      <View style={styles.footer}>
        <Button
          title="Réserver ce voyage"
          onPress={handleReserver}
          variant="primary"
          disabled={voyage.status !== 'disponible'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  trajetCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trajetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  prixValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  cooperativeInfo: {
    gap: 8,
  },
  cooperativeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  cooperativeContact: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  cooperativeAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  vehiculeInfo: {
    gap: 8,
  },
  chauffeurInfo: {
    gap: 8,
  },
  chauffeurName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  userInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});