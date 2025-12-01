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
import { router } from 'expo-router';
import { theme } from '../../../constants/theme';
import { utilisateurService } from '../../../services/utilisateurService';

export default function Profile() {
  const { utilisateur, logout, isLoading, refreshUtilisateur } = useAuth();
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-circle-outline" size={80} color={theme.colors.neutral[300]} />
        <Text style={styles.errorText}>Vous n'êtes pas connecté</Text>
        <TouchableOpacity
          style={styles.loginButton}
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
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {/* Header avec photo */}
        <View style={styles.header}>
          <View style={styles.photoContainer}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
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
          <View style={styles.quickInfoCard}>
            <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.quickInfoText}>{currentUser.telephone}</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.quickInfoText}>
              Membre depuis {new Date(currentUser.date_creation_compte).getFullYear()}
            </Text>
          </View>
        </View>

        {/* Menu principal */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Mon compte</Text>

          {/* Modifier le profil */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(client)/profil/modifierProfile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[50] }]}>
                <Ionicons name="create-outline" size={22} color={theme.colors.primary[500]} />
              </View>
              <Text style={styles.menuItemText}>Modifier le profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* 👇 NOUVEAU : Bouton Thème */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(client)/profil/theme-selector')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Ionicons name="color-palette-outline" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemText}>Thème de l'application</Text>
                <Text style={styles.menuItemSubtext}>Personnalisez votre interface</Text>
              </View>
            </View>
            <View style={styles.themePreview}>
              <View style={[styles.themeColorDot, { backgroundColor: theme.colors.primary[500] }]} />
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          {/* À propos de l'app */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(client)/profil/about')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.semantic.info + '20' }]}>
                <Ionicons name="information-circle-outline" size={22} color={theme.colors.semantic.info} />
              </View>
              <Text style={styles.menuItemText}>À propos de l'app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Politique et Confidentialité */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(client)/profil/privacy')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.neutral[100] }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.neutral[600]} />
              </View>
              <Text style={styles.menuItemText}>Politique et Confidentialité</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Aide & Contact */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(client)/profil/help')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary[50] }]}>
                <Ionicons name="help-circle-outline" size={22} color={theme.colors.secondary[500]} />
              </View>
              <Text style={styles.menuItemText}>Aide & Contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogoutPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.semantic.error + '20' }]}>
                <Ionicons name="log-out-outline" size={22} color={theme.colors.semantic.error} />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>Se déconnecter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.semantic.error} />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>GARENET v1.0.0</Text>
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="log-out-outline" size={40} color={theme.colors.semantic.error} />
              </View>
              <Text style={styles.modalTitle}>Déconnexion</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Voulez-vous vraiment vous déconnecter de votre compte ?
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
  },
  errorText: {
    fontSize: theme.typography.sizes.h3,
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.lg,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  loginButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: theme.colors.background.primary,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  roleText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
  },
  quickInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: -20,
    gap: theme.spacing.md,
  },
  quickInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  quickInfoText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  menuSection: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  // 👇 NOUVEAUX STYLES pour le bouton Thème
  menuItemSubtext: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  themeColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
    ...theme.shadows.sm,
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: theme.colors.semantic.error + '40',
  },
  logoutText: {
    color: theme.colors.semantic.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.tertiary,
  },
  // Styles Modal
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
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.semantic.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  modalBody: {
    padding: theme.spacing.xl,
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
    paddingVertical: theme.spacing.md,
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