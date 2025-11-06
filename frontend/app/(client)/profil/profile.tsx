import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Platform 
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import { router } from 'expo-router';
import { theme } from '../../../constants/theme';

export default function Profile() {
  const { utilisateur, logout, isLoading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!utilisateur) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vous n'êtes pas connecté</Text>
        <Button 
          title="Se connecter" 
          onPress={() => router.push('/se-connecter')} 
        />
      </View>
    );
  }

  const handleLogoutPress = () => {
    console.log('handleLogoutPress called');
    
    // Sur web, utiliser le modal personnalisé au lieu de window.confirm
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
      return;
    }
    
    // Sur mobile, afficher le modal personnalisé
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('confirmed logout');
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/acceuil');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Vous pouvez ajouter un Toast ou Alert d'erreur ici
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
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

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmation de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmation</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Voulez-vous vraiment vous déconnecter ?
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Se déconnecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
  },
  logoutButton: {
    backgroundColor: theme.colors.semantic.error,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  logoutText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
  },
  loadingText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.semantic.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  // Styles pour le modal de confirmation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.md,
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalMessage: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  confirmButton: {
    backgroundColor: theme.colors.semantic.error,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  confirmButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
  },
});