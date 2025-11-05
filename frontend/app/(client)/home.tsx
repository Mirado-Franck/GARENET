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
import { theme } from '../../constants/theme';

export default function Home() {
  const { utilisateur } = useAuth();

  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loadingCooperatives, setLoadingCooperatives] = useState(true);
  const [loadingAvis, setLoadingAvis] = useState(true);

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

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🚩</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Départ"
              value={depart}
              onChangeText={setDepart}
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>📍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Arrivée"
              value={arrivee}
              onChangeText={setArrivee}
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coopératives ⭐</Text>
          <TouchableOpacity onPress={() => router.push('/(client)/cooperatives')}>
            <Text style={styles.seeAllButton}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loadingCooperatives ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ marginVertical: 20 }} />
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avis récents 💬</Text>
        </View>

        {loadingAvis ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ marginVertical: 20 }} />
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
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 50,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.sizes.h3,
    color: theme.colors.text.light,
  },
  userName: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.xs,
  },
  notificationButton: {
    backgroundColor: theme.colors.background.overlay,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  locationText: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.caption,
  },
  searchContainer: {
    gap: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  searchButton: {
    backgroundColor: theme.colors.secondary[500],
    borderRadius: theme.borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  section: {
    marginTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  seeAllButton: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.caption,
    fontStyle: 'italic',
    paddingVertical: theme.spacing.xxxl,
  },
  horizontalList: {
    paddingRight: theme.spacing.xl,
  },
  cooperativeCard: {
    width: 140,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cooperativeLogo: {
    width: '100%',
    height: 80,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    fontSize: 40,
  },
  cooperativeName: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.semibold,
  },
  avisCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avisHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.round,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
  },
  avisInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  commentaire: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  trajet: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.tertiary,
  },
});