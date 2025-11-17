// app/(client)/profil/modifierProfile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { utilisateurService, UpdateProfileData, ChangePasswordData } from '../../../services/utilisateurService';
import { theme } from '../../../constants/theme';
import { Toast } from '../../../components/ui/Toast';

export default function ModifierProfile() {
  const router = useRouter();
  const { utilisateur, refreshUtilisateur } = useAuth();

  // États pour les informations de base
  const [formData, setFormData] = useState<UpdateProfileData>({
    nom: utilisateur?.nom || '',
    prenoms: utilisateur?.prenoms || '',
    email: utilisateur?.email || '',
    telephone: utilisateur?.telephone || '',
  });

  // États pour la photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  // États pour le mot de passe
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États généraux
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    if (utilisateur?.photo_identite) {
      const url = utilisateurService.getPhotoUrl(utilisateur.photo_identite);
      setCurrentPhotoUrl(url);
    }
  }, [utilisateur]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastConfig({ message, type });
    setTimeout(() => setToastConfig(null), 3500);
  };

  // ✨ Fonctions de gestion de la photo
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      showToast('Impossible de sélectionner l\'image', 'error');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour utiliser la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur prise photo:', error);
      showToast('Impossible de prendre la photo', 'error');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choisir dans la galerie',
          onPress: handlePickImage,
        },
        ...(photoUri || currentPhotoUrl
          ? [
              {
                text: 'Supprimer la photo',
                onPress: () => {
                  setPhotoUri(null);
                  setCurrentPhotoUrl(null);
                },
                style: 'destructive' as const,
              },
            ]
          : []),
        {
          text: 'Annuler',
          style: 'cancel' as const,
        },
      ],
      { cancelable: true }
    );
  };

  // ✨ Validation du formulaire
  const validateProfileForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.telephone && !/^[0-9]{10}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro invalide (10 chiffres requis)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: any = {};

    if (!passwordData.ancien_mot_de_passe) {
      newErrors.ancien_mot_de_passe = 'Ancien mot de passe requis';
    }

    if (!passwordData.nouveau_mot_de_passe) {
      newErrors.nouveau_mot_de_passe = 'Nouveau mot de passe requis';
    } else if (passwordData.nouveau_mot_de_passe.length < 6) {
      newErrors.nouveau_mot_de_passe = 'Minimum 6 caractères';
    }

    if (passwordData.nouveau_mot_de_passe !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✨ Sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    setErrors({});

    if (!validateProfileForm()) {
      return;
    }

    if (!utilisateur?.id) {
      showToast('Utilisateur non trouvé', 'error');
      return;
    }

    setLoading(true);
    try {
      await utilisateurService.updateProfile(
        utilisateur.id,
        formData,
        photoUri || undefined
      );

      // Rafraîchir les données utilisateur
      await refreshUtilisateur?.();

      showToast('Profil mis à jour avec succès ! 🎉', 'success');

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Erreur update profil:', error);
      showToast(error.error || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✨ Changer le mot de passe
  const handleChangePassword = async () => {
    setErrors({});

    if (!validatePasswordForm()) {
      return;
    }

    if (!utilisateur?.id) {
      showToast('Utilisateur non trouvé', 'error');
      return;
    }

    setLoading(true);
    try {
      await utilisateurService.changePassword(utilisateur.id, passwordData);

      showToast('Mot de passe modifié avec succès ! 🔒', 'success');

      // Réinitialiser le formulaire de mot de passe
      setPasswordData({
        ancien_mot_de_passe: '',
        nouveau_mot_de_passe: '',
      });
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      showToast(error.message || 'Erreur lors du changement de mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const displayPhotoUrl = photoUri || currentPhotoUrl;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo de profil */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={showPhotoOptions}>
            {displayPhotoUrl ? (
              <Image source={{ uri: displayPhotoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color={theme.colors.neutral[400]} />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={theme.colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Appuyez pour modifier la photo</Text>
        </View>

        {/* Formulaire informations */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={[styles.input, errors.nom && styles.inputError]}
              placeholder="Votre nom"
              value={formData.nom}
              onChangeText={(text) => updateFormData('nom', text)}
              autoCapitalize="words"
              editable={!loading}
            />
            {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénoms</Text>
            <TextInput
              style={styles.input}
              placeholder="Vos prénoms"
              value={formData.prenoms}
              onChangeText={(text) => updateFormData('prenoms', text)}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="exemple@email.com"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={[styles.input, errors.telephone && styles.inputError]}
              placeholder="0340000000"
              value={formData.telephone}
              onChangeText={(text) => updateFormData('telephone', text)}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
            {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.text.inverse} />
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Section mot de passe */}
        <View style={styles.formSection}>
          <TouchableOpacity
            style={styles.passwordSectionHeader}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ancien mot de passe *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.ancien_mot_de_passe && styles.inputError]}
                    placeholder="Votre mot de passe actuel"
                    value={passwordData.ancien_mot_de_passe}
                    onChangeText={(text) => {
                      setPasswordData((prev) => ({ ...prev, ancien_mot_de_passe: text }));
                      if (errors.ancien_mot_de_passe) {
                        setErrors((prev: any) => ({ ...prev, ancien_mot_de_passe: undefined }));
                      }
                    }}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.ancien_mot_de_passe && (
                  <Text style={styles.errorText}>{errors.ancien_mot_de_passe}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.nouveau_mot_de_passe && styles.inputError]}
                    placeholder="Minimum 6 caractères"
                    value={passwordData.nouveau_mot_de_passe}
                    onChangeText={(text) => {
                      setPasswordData((prev) => ({ ...prev, nouveau_mot_de_passe: text }));
                      if (errors.nouveau_mot_de_passe) {
                        setErrors((prev: any) => ({ ...prev, nouveau_mot_de_passe: undefined }));
                      }
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.nouveau_mot_de_passe && (
                  <Text style={styles.errorText}>{errors.nouveau_mot_de_passe}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le nouveau mot de passe *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors((prev: any) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, styles.passwordButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={20} color={theme.colors.text.inverse} />
                    <Text style={styles.saveButtonText}>Modifier le mot de passe</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Toast */}
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onHide={() => setToastConfig(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    backgroundColor: theme.colors.background.primary,
    marginBottom: theme.spacing.lg,
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: theme.colors.primary[500],
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background.primary,
  },
  photoHint: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  formSection: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  passwordSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  inputError: {
    borderColor: theme.colors.semantic.error,
    borderWidth: 1.5,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingRight: 50,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.sizes.small,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  passwordButton: {
    backgroundColor: theme.colors.secondary[500],
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});