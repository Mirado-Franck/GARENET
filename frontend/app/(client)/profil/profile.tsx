// app/(client)/profil/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { utilisateurService } from '../../../services/utilisateurService';

export default function Profile() {
  const { utilisateur, logout, isLoading, refreshUtilisateur } = useAuth();
  const { theme } = useTheme(); // 👈 Utilisation du thème dynamique
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(utilisateur);

  useEffect(() => {
    setCurrentUser(utilisateur);
  }, [utilisateur]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUtilisateur();
      setCurrentUser(utilisateur);
    } catch (error) {
      console.error('Erreur refresh profil:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          Chargement du profil...
        </Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background.secondary }]}>
        <Ionicons name="person-circle-outline" size={80} color={theme.colors.neutral[300]} />
        <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
          Vous n'êtes pas connecté
        </Text>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => router.push('/se-connecter')}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/acceuil');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const photoUrl = utilisateurService.getPhotoUrl(currentUser.photo_identite);

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {/* Header avec photo */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary[500] }]}>
          <View style={styles.photoContainer}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.background.primary }]}>
                <Ionicons name="person" size={60} color={theme.colors.neutral[400]} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {currentUser.prenoms} {currentUser.nom}
          </Text>
          {currentUser.email && (
            <Text style={styles.userEmail}>{currentUser.email}</Text>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{currentUser.role}</Text>
          </View>
        </View>

        {/* Informations rapides */}
        <View style={styles.quickInfoSection}>
          <View style={[styles.quickInfoCard, { backgroundColor: theme.colors.background.primary }]}>
            <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.quickInfoText, { color: theme.colors.text.secondary }]}>
              {currentUser.telephone}
            </Text>
          </View>
          <View style={[styles.quickInfoCard, { backgroundColor: theme.colors.background.primary }]}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.quickInfoText, { color: theme.colors.text.secondary }]}>
              Membre depuis {new Date(currentUser.date_creation_compte).getFullYear()}
            </Text>
          </View>
        </View>

        {/* Menu principal */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            Mon compte
          </Text>

          {/* Modifier le profil */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.background.primary }]}
            onPress={() => router.push('/(client)/profil/modifierProfile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[50] }]}>
                <Ionicons name="create-outline" size={22} color={theme.colors.primary[500]} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Modifier le profil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Thème */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.background.primary }]}
            onPress={() => router.push('/(client)/profil/theme-selector')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Ionicons name="color-palette-outline" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                  Thème de l'application
                </Text>
                <Text style={[styles.menuItemSubtext, { color: theme.colors.text.tertiary }]}>
                  Personnalisez votre interface
                </Text>
              </View>
            </View>
            <View style={styles.themePreview}>
              <View style={[styles.themeColorDot, { backgroundColor: theme.colors.primary[500] }]} />
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          {/* À propos de l'app */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.background.primary }]}
            onPress={() => router.push('/(client)/profil/about')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.semantic.info + '20' }]}>
                <Ionicons name="information-circle-outline" size={22} color={theme.colors.semantic.info} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                À propos de l'app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Politique et Confidentialité */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.background.primary }]}
            onPress={() => router.push('/(client)/profil/privacy')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.neutral[100] }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.neutral[600]} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Politique et Confidentialité
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Aide & Contact */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.background.primary }]}
            onPress={() => router.push('/(client)/profil/help')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary[50] }]}>
                <Ionicons name="help-circle-outline" size={22} color={theme.colors.secondary[500]} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Aide & Contact
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.logoutItem,
              { 
                backgroundColor: theme.colors.background.primary,
                borderColor: theme.colors.semantic.error + '40'
              }
            ]}
            onPress={handleLogoutPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.semantic.error + '20' }]}>
                <Ionicons name="log-out-outline" size={22} color={theme.colors.semantic.error} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.colors.semantic.error }]}>
                Se déconnecter
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.semantic.error} />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.text.tertiary }]}>
            GARENET v1.0.0
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de confirmation de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.neutral[200] }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: theme.colors.semantic.error + '20' }]}>
                <Ionicons name="log-out-outline" size={40} color={theme.colors.semantic.error} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                Déconnexion
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalMessage, { color: theme.colors.text.secondary }]}>
                Voulez-vous vraiment vous déconnecter de votre compte ?
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { 
                    backgroundColor: theme.colors.neutral[100],
                    borderColor: theme.colors.neutral[300]
                  }
                ]}
                onPress={cancelLogout}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.semantic.error }]}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginVertical: 15,
    textAlign: 'center',
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 50,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  quickInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: -20,
    gap: 12,
  },
  quickInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickInfoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  menuItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutItem: {
    borderWidth: 1,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 22,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});