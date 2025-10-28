import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';

// Données simulées des coopératives de Madagascar
const cooperativesEpinglees = [
  {
    id: 1,
    nom: 'Cotrama',
    note: 4.5,
    avis: 127,
    trajets: ['Antananarivo - Toamasina', 'Antananarivo - Antsirabe', 'Antananarivo - Fianarantsoa'],
    image: 'https://via.placeholder.com/80x80/4CAF50/white?text=COTRAMA',
    abonne: true,
    description: 'Transport interurbain fiable depuis 1995',
    voyagesRealises: 12
  },
  {
    id: 2,
    nom: 'Transfi',
    note: 4.2,
    avis: 89,
    trajets: ['Antananarivo - Mahajanga', 'Antananarivo - Toliara', 'Antsirabe - Morondava'],
    image: 'https://via.placeholder.com/80x80/2196F3/white?text=TRANSFI',
    abonne: false,
    description: 'Confort et ponctualité garantis',
    voyagesRealises: 8
  },
  {
    id: 3,
    nom: 'Mafio',
    note: 4.7,
    avis: 156,
    trajets: ['Antananarivo - Toliara', 'Fianarantsoa - Manakara', 'Antsirabe - Morondava'],
    image: 'https://via.placeholder.com/80x80/FF9800/white?text=MAFIO',
    abonne: true,
    description: 'Service premium avec Wi-Fi',
    voyagesRealises: 15
  },
  {
    id: 4,
    nom: 'Sonatra',
    note: 4.0,
    avis: 67,
    trajets: ['Toamasina - Maroantsetra', 'Antananarivo - Toamasina', 'Moramanga - Toamasina'],
    image: 'https://via.placeholder.com/80x80/9C27B0/white?text=SONATRA',
    abonne: false,
    description: 'Spécialiste route côte est',
    voyagesRealises: 5
  },
  {
    id: 5,
    nom: 'Madatrans',
    note: 4.3,
    avis: 94,
    trajets: ['Mahajanga - Nosy Be', 'Antananarivo - Mahajanga', 'Antsiranana - Sambava'],
    image: 'https://via.placeholder.com/80x80/607D8B/white?text=MADATRANS',
    abonne: false,
    description: 'Expert région nord-ouest',
    voyagesRealises: 3
  }
];

export default function ListeCooperative() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCooperatives, setFilteredCooperatives] = useState(cooperativesEpinglees);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCooperatives(cooperativesEpinglees);
    } else {
      const filtered = cooperativesEpinglees.filter(coop =>
        coop.nom.toLowerCase().includes(query.toLowerCase()) ||
        coop.trajets.some(trajet => trajet.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCooperatives(filtered);
    }
  };

  const handleVoirDetails = (coopId: number) => {
    router.push(`/voyages/detailCooperative?id=${coopId}`);
  };

  const handleVoirVoyages = (coopId: number) => {
    router.push(`/voyages/voyagePropose?id=${coopId}`);
  };

  const handleLogoPress = (coopId: number) => {
    router.push(`/voyages/detailCooperative?id=${coopId}`);
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Vos coopératives</Text>
        <Text style={styles.subtitle}>
          {filteredCooperatives.length} coopérative(s) où vous avez voyagé
        </Text>
      </View>

      {/* Barre de recherche */}
      <SearchBar
        placeholder="Rechercher une coopérative ou un trajet..."
        onSearch={handleSearch}
        style={styles.searchBar}
      />

      {/* Liste des coopératives */}
      <ScrollView style={styles.coopList} showsVerticalScrollIndicator={false}>
        {filteredCooperatives.map((coop) => (
          <View key={coop.id} style={styles.coopCard}>
            {/* En-tête de la carte */}
            <View style={styles.coopHeader}>
              <TouchableOpacity onPress={() => handleLogoPress(coop.id)}>
                <Image source={{ uri: coop.image }} style={styles.coopImage} />
              </TouchableOpacity>
              <View style={styles.coopInfo}>
                <View style={styles.coopTitleRow}>
                  <Text style={styles.coopName}>{coop.nom}</Text>
                  {coop.abonne && (
                    <View style={styles.abonneBadge}>
                      <Text style={styles.abonneText}>Abonné</Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {coop.note}</Text>
                  <Text style={styles.avis}>({coop.avis} avis)</Text>
                </View>
                <Text style={styles.coopDescription}>{coop.description}</Text>
                <Text style={styles.voyagesRealises}>
                  {coop.voyagesRealises} voyages réalisés avec vous
                </Text>
              </View>
            </View>

            {/* Trajets populaires */}
            <View style={styles.trajetsSection}>
              <Text style={styles.trajetsTitle}>Trajets populaires:</Text>
              <View style={styles.trajetsList}>
                {coop.trajets.map((trajet, index) => (
                  <Text key={index} style={styles.trajetItem}>• {trajet}</Text>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Voir les voyages"
                onPress={() => handleVoirVoyages(coop.id)}
                variant="primary"
                style={styles.actionButton}
              />
              <Button
                title="Voir détails"
                onPress={() => handleVoirDetails(coop.id)}
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {filteredCooperatives.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune coopérative trouvée</Text>
          <Text style={styles.emptySubtext}>
            Essayez avec d'autres termes de recherche
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchBar: {
    marginBottom: 16,
  },
  coopList: {
    flex: 1,
  },
  coopCard: {
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
  coopHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coopImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  coopInfo: {
    flex: 1,
  },
  coopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  abonneBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  abonneText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  avis: {
    fontSize: 12,
    color: '#888',
  },
  coopDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  voyagesRealises: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  trajetsSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trajetsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  trajetsList: {
    marginLeft: 8,
  },
  trajetItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    minHeight: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});