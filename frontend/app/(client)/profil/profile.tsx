import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import  Button  from '../../../components/ui/Button';
import { router } from 'expo-router';

export default function Profile() {
  const { utilisateur, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!utilisateur) {
    return (
      <View style={styles.container}>
        <Text>Vous n'êtes pas connecté</Text>
        <Button 
          title="Se connecter" 
          onPress={() => router.push('/se-connecter')} 
        />
      </View>
    );
  }


const handleLogout = () => {
  console.log('handleLogout called'); // debug : vérifier si le clic arrive ici

  // web : utiliser window.confirm car Alert.alert peut ne pas fonctionner
  if (Platform.OS === 'web') {
    const ok = window.confirm('Voulez-vous vraiment vous déconnecter ?');
    if (!ok) return;
    (async () => {
      try {
        await logout();
        router.replace('/acceuil');
      } catch (error) {
        console.error('Erreur déconnexion:', error);
        alert('Impossible de se déconnecter. Réessayez.');
      }
    })();
    return;
  }

  // mobile : Alert natif
  Alert.alert(
    'Confirmation',
    'Voulez-vous vraiment vous déconnecter ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          console.log('confirmed logout'); // debug : vérifie confirmation
          try {
            await logout();
            router.replace('/acceuil');
          } catch (error) {
            console.error('Erreur déconnexion:', error);
            Alert.alert('Erreur', 'Impossible de se déconnecter. Réessayez.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nom complet :</Text>
        <Text style={styles.value}>{utilisateur.nom} {utilisateur.prenoms}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email :</Text>
        <Text style={styles.value}>{utilisateur.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Téléphone :</Text>
        <Text style={styles.value}>{utilisateur.telephone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Rôle :</Text>
        <Text style={styles.value}>{utilisateur.role}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});