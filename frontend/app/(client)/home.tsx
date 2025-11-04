import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { cooperativeService, Cooperative } from '../../services/cooperativeService';
import { avisService, Avis } from '../../services/avisService';

export default function Home() {
  const { utilisateur } = useAuth();

  // États
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loadingCooperatives, setLoadingCooperatives] = useState(true);
  const [loadingAvis, setLoadingAvis] = useState(true);

  // Charger les données au montage
  useEffect(() => {
    loadCooperatives();
    loadAvis();
  }, []);

  const loadCooperatives = async () => {
    try {
      setLoadingCooperatives(true);
      const data = await cooperativeService.getAllCooperatives();
      setCooperatives(data);
    } catch (error) {
      console.error('Erreur chargement coopératives:', error);
    } finally {
      setLoadingCooperatives(false);
    }
  };

  const loadAvis = async () => {
    try {
      setLoadingAvis(true);
      const data = await avisService.getLatestAvis(5);
      setAvis(data.avis);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoadingAvis(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleSearch = () => {
    // Rediriger vers la page de résultats avec paramètres
    router.push(`/acceuil?depart=${depart}&arrivee=${arrivee}`);
  };

  const renderCooperativeCard = ({ item }: { item: Cooperative }) => (
    <TouchableOpacity 
      style={styles.cooperativeCard}
      onPress={() => router.push(`/(client)/cooperatives/${item.id}`)}
    >
      <View style={styles.cooperativeLogo}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.logoImage} />
        ) : (
          <Text style={styles.logoPlaceholder}>🚌</Text>
        )}
      </View>
      <Text style={styles.cooperativeName} numberOfLines={2}>
        {item.nom}
      </Text>
      {item.note_moyenne && (
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.ratingText}>{item.note_moyenne.toFixed(1)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAvisCard = ({ item }: { item: Avis }) => (
    <TouchableOpacity style={styles.avisCard}>
      <View style={styles.avisHeader}>
        <View style={styles.avatarContainer}>
          {item.client.photo ? (
            <Image source={{ uri: item.client.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.client.nom_complet.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.avisInfo}>
          <Text style={styles.clientName}>{item.client.nom_complet}</Text>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => (
              <Text key={i} style={styles.star}>
                {i < item.note ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.commentaire} numberOfLines={3}>
        {item.commentaire}
      </Text>
      <Text style={styles.trajet}>📍 {item.voyage.trajet}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🎨 Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{utilisateur?.nom}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(client)/notification')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>Fianarantsoa, Madagascar</Text>
        </View>

        {/* 🔍 Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🚩</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Départ"
              value={depart}
              onChangeText={setDepart}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>📍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Arrivée"
              value={arrivee}
              onChangeText={setArrivee}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ⭐ Section 1 — Coopératives */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coopératives ⭐</Text>
          <TouchableOpacity onPress={() => router.push('/(client)/cooperatives')}>
            <Text style={styles.seeAllButton}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loadingCooperatives ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
        ) : cooperatives.length === 0 ? (
          <Text style={styles.emptyText}>Aucune coopérative disponible</Text>
        ) : (
          <FlatList
            data={cooperatives}
            renderItem={renderCooperativeCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}
      </View>

      {/* 💬 Section 2 — Avis récents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avis récents 💬</Text>
        </View>

        {loadingAvis ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
        ) : avis.length === 0 ? (
          <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
        ) : (
          <FlatList
            data={avis}
            renderItem={renderAvisCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 18,
    color: '#E0F2FF',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  notificationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    color: '#E0F2FF',
    fontSize: 14,
  },
  searchContainer: {
    gap: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 30,
  },
  horizontalList: {
    paddingRight: 20,
  },
  cooperativeCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cooperativeLogo: {
    width: '100%',
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    fontSize: 40,
  },
  cooperativeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  avisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avisHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avisInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  commentaire: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  trajet: {
    fontSize: 12,
    color: '#999',
  },
});