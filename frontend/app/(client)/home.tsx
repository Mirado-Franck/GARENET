import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';

const voyagesSimules = [
  {
    id: '1',
    destination: 'Antananarivo - Toamasina',
    date: '15 Déc 2024',
    heure: '08:00',
    prix: 25000,
    placesDisponibles: 12,
    cooperative: 'Cotisse Transport'
  },
  {
    id: '2', 
    destination: 'Antananarivo - Antsirabe',
    date: '16 Déc 2024',
    heure: '10:30',
    prix: 15000,
    placesDisponibles: 8,
    cooperative: 'Bus Express'
  },
  {
    id: '3',
    destination: 'Antananarivo - Mahajanga',
    date: '17 Déc 2024',
    prix: 45000,
    heure: '14:00',
    placesDisponibles: 5,
    cooperative: 'Nord Express'
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [voyages, setVoyages] = useState(voyagesSimules);
  const [refreshing, setRefreshing] = useState(false);

  const voyagesFiltres = voyages.filter(voyage =>
    voyage.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voyage.cooperative.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setVoyages(voyagesSimules);
      setRefreshing(false);
    }, 2000);
  };

  const handleReserver = (voyageId: string) => {
    console.log(`Réservation du voyage: ${voyageId}`);
    alert(`Réservation du voyage ${voyageId} - À implémenter`);
  };

  const handleVoirDetails = (voyageId: string) => {
    console.log(`Voir détails du voyage: ${voyageId}`);
    alert(`Détails voyage ${voyageId} - À implémenter`);
  };

  // ✅ CORRECTION : Fonction qui respecte l'interface (query: string) => void
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // ✅ Fonction pour effacer la recherche
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 🎯 En-tête de la page */}
      <View style={styles.header}>
        <Text style={styles.title}>Bonjour 👋</Text>
        <Text style={styles.subtitle}>
          Trouvez votre prochain voyage
        </Text>
      </View>

      {/* 🔍 Barre de recherche CORRIGÉE */}
      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Rechercher un voyage ou une destination..."
          onSearch={handleSearch} // ✅ Fonction correcte
          onClear={handleClearSearch} // ✅ Optionnel
        />
      </View>

      {/* ⚡ Actions rapides */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.buttonsContainer}>
          <Button 
            title="Voir tous les voyages" 
            onPress={() => console.log('Navigation vers voyages')}
            variant="primary"
            style={styles.actionButton}
          />
          <Button 
            title="Mes réservations" 
            onPress={() => console.log('Navigation vers réservations')}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* 🎫 Liste des voyages disponibles */}
      <View style={styles.voyagesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Voyages disponibles</Text>
          <Text style={styles.voyagesCount}>
            {voyagesFiltres.length} voyage(s) trouvé(s)
          </Text>
        </View>

        <ScrollView
          style={styles.voyagesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          }
        >
          {voyagesFiltres.length > 0 ? (
            voyagesFiltres.map((voyage) => (
              <View key={voyage.id} style={styles.voyageCard}>
                <View style={styles.voyageHeader}>
                  <Text style={styles.destination}>{voyage.destination}</Text>
                  <Text style={styles.prix}>{voyage.prix.toLocaleString()} Ar</Text>
                </View>

                <View style={styles.voyageInfo}>
                  <Text style={styles.infoText}>📅 {voyage.date}</Text>
                  <Text style={styles.infoText}>🕒 {voyage.heure}</Text>
                  <Text style={styles.infoText}>👥 {voyage.placesDisponibles} places</Text>
                </View>

                <Text style={styles.cooperative}>🚌 {voyage.cooperative}</Text>

                <View style={styles.cardActions}>
                  <Button 
                    title="Voir détails" 
                    onPress={() => handleVoirDetails(voyage.id)}
                    variant="secondary"
                    style={styles.detailsButton}
                  />
                  <Button 
                    title="Réserver" 
                    onPress={() => handleReserver(voyage.id)}
                    variant="primary"
                    style={styles.reserverButton}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun voyage trouvé</Text>
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos critères de recherche
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// 🎨 Les styles restent identiques
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 0.48,
  },
  voyagesSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  voyagesCount: {
    fontSize: 14,
    color: '#64748b',
  },
  voyagesList: {
    flex: 1,
  },
  voyageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  voyageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  destination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  prix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  voyageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
  },
  cooperative: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 0.48,
  },
  reserverButton: {
    flex: 0.48,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});