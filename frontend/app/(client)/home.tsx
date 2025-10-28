import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';

// Données simulées pour Madagascar
const cooperativesEpinglees = [
  {
    id: 1,
    nom: 'Cotrama',
    note: 4.5,
    trajetsPopulaires: ['Tana - Tamatave', 'Tana - Antsirabe'],
    image: 'https://via.placeholder.com/100x100/4CAF50/white?text=COTRAMA',
    abonne: true
  },
  {
    id: 2,
    nom: 'Transfi',
    note: 4.2,
    trajetsPopulaires: ['Tana - Fianar', 'Tana - Mahajanga'],
    image: 'https://via.placeholder.com/100x100/2196F3/white?text=TRANSFI',
    abonne: true
  },
  {
    id: 3,
    nom: 'Mafio',
    note: 4.7,
    trajetsPopulaires: ['Tana - Toliara', 'Antsirabe - Fianar'],
    image: 'https://via.placeholder.com/100x100/FF9800/white?text=MAFIO',
    abonne: false
  }
];

// Voyages recommandés depuis Fianarantsoa
const voyagesRecommandes = [
  {
    id: 1,
    depart: 'Fianarantsoa',
    arrivee: 'Antananarivo',
    cooperative: 'Cotrama',
    prix: '30 000 Ar',
    duree: '10h',
    departTime: '06:00',
    placesDisponibles: 8
  },
  {
    id: 2,
    depart: 'Fianarantsoa',
    arrivee: 'Manakara',
    cooperative: 'Mafio',
    prix: '15 000 Ar',
    duree: '4h',
    departTime: '07:30',
    placesDisponibles: 12
  },
  {
    id: 3,
    depart: 'Fianarantsoa',
    arrivee: 'Toliara',
    cooperative: 'Transfi',
    prix: '40 000 Ar',
    duree: '12h',
    departTime: '05:00',
    placesDisponibles: 5
  },
  {
    id: 4,
    depart: 'Fianarantsoa',
    arrivee: 'Antsirabe',
    cooperative: 'Cotrama',
    prix: '25 000 Ar',
    duree: '8h',
    departTime: '08:00',
    placesDisponibles: 15
  }
];

export default function HomeClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Recherche:', query);
    // Redirection vers la page de résultats de recherche
    if (query.trim()) {
      router.push('/voyages/listeCooperative');
    }
  };

  const handleVoirCooperative = (coopId: number) => {
    router.push(`/voyages/detailCooperative?id=${coopId}`);
  };

  const handleVoirToutesCooperatives = () => {
    router.push('/voyages/listeCooperative');
  };

  const handleVoirDetailsVoyage = (voyageId: number) => {
    router.push(`/voyages/detailVoyage?id=${voyageId}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.bienvenue}>Bon retour Mirado</Text>
        <Text style={styles.sousTitre}>Localisation: Fianarantsoa</Text>
      </View>

      {/* Barre de recherche principale */}
      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Rechercher un trajet, une coopérative..."
          onSearch={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Cooperatives épinglées */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos coopératives</Text>
          <Button
            title="Voir tout"
            onPress={handleVoirToutesCooperatives}
            variant="secondary"
            style={styles.voirToutButton}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coopList}>
          {cooperativesEpinglees.map((coop) => (
            <TouchableOpacity
              key={coop.id}
              style={styles.coopCard}
              onPress={() => handleVoirCooperative(coop.id)}
            >
              <Image source={{ uri: coop.image }} style={styles.coopImage} />
              <View style={styles.coopInfo}>
                <Text style={styles.coopName}>{coop.nom}</Text>
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>⭐ {coop.note}</Text>
                </View>
                <Text style={styles.coopTrajets}>
                  {coop.trajetsPopulaires.join(', ')}
                </Text>
                {coop.abonne && (
                  <View style={styles.abonneBadge}>
                    <Text style={styles.abonneText}>Abonné</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Voyages recommandés depuis Fianarantsoa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voyages recommandés depuis Fianarantsoa</Text>
        {voyagesRecommandes.map((voyage) => (
          <TouchableOpacity
            key={voyage.id}
            style={styles.voyageCard}
            onPress={() => handleVoirDetailsVoyage(voyage.id)}
          >
            <View style={styles.voyageHeader}>
              <Text style={styles.voyageRoute}>
                {voyage.depart} → {voyage.arrivee}
              </Text>
              <Text style={styles.voyagePrix}>{voyage.prix}</Text>
            </View>
            
            <View style={styles.voyageDetails}>
              <Text style={styles.voyageCoop}>{voyage.cooperative}</Text>
              <Text style={styles.voyageInfo}>
                {voyage.departTime} • {voyage.duree} • {voyage.placesDisponibles} places
              </Text>
            </View>

            <View style={styles.voyageAction}>
              <Button
                title="Voir détail"
                onPress={() => handleVoirDetailsVoyage(voyage.id)}
                variant="primary"
                style={styles.detailButton}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  bienvenue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sousTitre: {
    fontSize: 16,
    color: '#666',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchBar: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  voirToutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 0,
  },
  coopList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  coopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coopImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  coopInfo: {
    flex: 1,
  },
  coopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  rating: {
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  coopTrajets: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  abonneBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  abonneText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  voyageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voyageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voyageRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  voyagePrix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  voyageDetails: {
    marginBottom: 12,
  },
  voyageCoop: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  voyageInfo: {
    fontSize: 14,
    color: '#888',
  },
  voyageAction: {
    alignItems: 'flex-end',
  },
  detailButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    minHeight: 36,
  },
});