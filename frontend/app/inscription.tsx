// app/inscription.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import { utilisateurService, InscriptionData } from '../services/utilisateurService';
import { theme } from '../constants/theme';

export default function Inscription() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<InscriptionData>({
    nom: '',
    prenoms: '',
    email: '',
    mot_de_passe: '',
    telephone: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<InscriptionData & { confirmPassword: string; api: string }>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9]{10}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Numéro invalide (10 chiffres requis)';
    }

    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Minimum 6 caractères';
    }

    if (formData.mot_de_passe !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInscription = async () => {
    setErrors({});
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await utilisateurService.inscription(formData);
      
      setSuccessMessage('🎉 Inscription réussie ! Redirection...');
      
      setTimeout(() => {
        router.replace('/se-connecter');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      
      if (error.error === "Email déjà utilisé") {
        setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
      } else if (error.error === "Champs obligatoires manquants") {
        setErrors(prev => ({ ...prev, api: 'Veuillez remplir tous les champs obligatoires' }));
      } else if (error.error) {
        setErrors(prev => ({ ...prev, api: error.error }));
      } else {
        setErrors(prev => ({ ...prev, api: 'Une erreur est survenue lors de l\'inscription' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeConnecter = () => {
    router.push('/se-connecter');
  };

  const updateFormData = (field: keyof InscriptionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.api) {
      setErrors(prev => ({ ...prev, api: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inscription</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez Garenet pour réserver vos voyages
          </Text>

          {successMessage ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.semantic.success} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errors.api ? (
            <View style={styles.errorApiContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.semantic.error} />
              <Text style={styles.errorApiText}>{errors.api}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={[styles.input, errors.nom && styles.inputError]}
              placeholder="Votre nom"
              value={formData.nom}
              onChangeText={(text) => updateFormData('nom', text)}
              autoCapitalize="words"
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="exemple@email.com"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={[styles.input, errors.telephone && styles.inputError]}
              placeholder="0340000000"
              value={formData.telephone}
              onChangeText={(text) => updateFormData('telephone', text)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.mot_de_passe && styles.inputError
                ]}
                placeholder="Minimum 6 caractères"
                value={formData.mot_de_passe}
                onChangeText={(text) => updateFormData('mot_de_passe', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={22} 
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {errors.mot_de_passe && (
              <Text style={styles.errorText}>{errors.mot_de_passe}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError
                ]}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={22} 
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <Button
            title={loading ? 'Inscription en cours...' : 'S\'inscrire'}
            onPress={handleInscription}
            variant="primary"
            style={styles.submitButton}
            disabled={loading || !!successMessage}
          />

          {loading && (
            <ActivityIndicator size="large" color={theme.colors.primary[500]} style={styles.loader} />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={handleSeConnecter}>
              <Text style={styles.linkText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 50,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  formContainer: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxxl,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  successText: {
    color: theme.colors.semantic.success,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.medium,
  },
  errorApiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorApiText: {
    color: theme.colors.semantic.error,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.medium,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.primary,
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
    backgroundColor: theme.colors.background.primary,
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
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  linkText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.semibold,
  },
});