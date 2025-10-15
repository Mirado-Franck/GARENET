// app/acceuil.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';

export default function Acceuil() {
  const router = useRouter();

  const handleSeConnecter = () => {
    router.push('/se-connecter');
  };

  const handleSInscrire = () => {
    router.push('/inscription');
  };

  const handleVillePress = (ville: string) => {
    Alert.alert('Ville sélectionnée', `Vous avez choisi ${ville}`);
  };

  // Données simulées pour les villes
  const villes = [
    { id: 1, nom: 'Fianarantsoa', image: '🏞️' },
    { id: 2, nom: 'Antananarivo', image: '🏙️' },
    { id: 3, nom: 'Toamasina', image: '🌊' },
    { id: 4, nom: 'Mahajanga', image: '🏖️' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Section En-tête */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌱 GARENET</Text>
        <Text style={styles.title}>Bienvenue sur Garenet</Text>
        <Text style={styles.subtitle}>
          Réservez vos voyages en toute simplicité
        </Text>
      </View>

      {/* Section Localisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Votre localisation</Text>
        <View style={styles.localisationCard}>
          <Text style={styles.localisationIcon}>📍</Text>
          <View style={styles.localisationText}>
            <Text style={styles.villeActuelle}>Fianarantsoa</Text>
            <Text style={styles.localisationSubtitle}>
              Ville détectée automatiquement
            </Text>
          </View>
        </View>
        
        <Text style={styles.villesTitle}>Autres villes disponibles</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.villesContainer}
        >
          {villes.map((ville) => (
            <TouchableOpacity 
              key={ville.id}
              style={styles.villeCard}
              onPress={() => handleVillePress(ville.nom)}
            >
              <Text style={styles.villeImage}>{ville.image}</Text>
              <Text style={styles.villeNom}>{ville.nom}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section Voyages Recommandés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voyages recommandés</Text>
        <View style={styles.voyagesContainer}>
          {/* Placeholder voyage 1 */}
          <View style={styles.voyagePlaceholder}>
            <View style={styles.voyageImagePlaceholder}>
              <Text style={styles.placeholderText}>🛣️</Text>
            </View>
            <View style={styles.voyageInfo}>
              <Text style={styles.voyageTitre}>Fianarantsoa - Antananarivo</Text>
              <Text style={styles.voyageDetails}>Départ: 08:00 • Prix: 25,000 Ar</Text>
              <Text style={styles.voyageCooperative}>SONATRA</Text>
            </View>
          </View>

          {/* Placeholder voyage 2 */}
          <View style={styles.voyagePlaceholder}>
            <View style={styles.voyageImagePlaceholder}>
              <Text style={styles.placeholderText}>🚌</Text>
            </View>
            <View style={styles.voyageInfo}>
              <Text style={styles.voyageTitre}>Fianarantsoa - Toamasina</Text>
              <Text style={styles.voyageDetails}>Départ: 14:30 • Prix: 35,000 Ar</Text>
              <Text style={styles.voyageCooperative}>KOFIMADA</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section Boutons d'action */}
      <View style={styles.actionsSection}>
        <Button
          title="Se connecter"
          onPress={handleSeConnecter}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="S'inscrire"
          onPress={handleSInscrire}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Explorez le monde avec nous</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  localisationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  localisationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  localisationText: {
    flex: 1,
  },
  villeActuelle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  localisationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  villesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  villesContainer: {
    marginBottom: 10,
  },
  villeCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  villeImage: {
    fontSize: 24,
    marginBottom: 8,
  },
  villeNom: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  voyagesContainer: {
    gap: 15,
  },
  voyagePlaceholder: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  voyageImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  placeholderText: {
    fontSize: 24,
  },
  voyageInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  voyageTitre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  voyageDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  voyageCooperative: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    marginHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});