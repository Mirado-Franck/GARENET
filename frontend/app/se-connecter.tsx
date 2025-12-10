// app/se-connecter.tsx
import React, { useState } from 'react';
import { Toast } from '../components/ui/Toast';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SeConnecter() {
  const router = useRouter();
  const { theme } = useTheme(); // 👈 thème dynamique
  const { login, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

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
      paddingTop: theme.spacing.xxxl + 20,
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
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.xl,
    },
    forgotPasswordText: {
      color: theme.colors.primary[500],
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
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

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleConnexion = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.mot_de_passe);

      showToast('Connexion réussie !', 'success');

      setTimeout(() => {
        if (redirectAfterLogin) {
          const path = redirectAfterLogin;
          setRedirectAfterLogin(null);
          router.replace(path as any);
        } else {
          router.replace('/(client)/home');
        }
      }, 1000);

    } catch (error: any) {
      Alert.alert(
        "Échec de connexion",
        "Email ou mot de passe incorrect. Veuillez réessayer.",
        [{ text: "OK" }]
      );
      // Optionnel : showToast('Email ou mot de passe invalide', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = () => {
    router.push('/inscription');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Connexion</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Bon retour !</Text>
            <Text style={styles.subtitle}>
              {redirectAfterLogin 
                ? 'Connectez-vous pour continuer votre réservation'
                : 'Connectez-vous pour accéder à votre compte'
              }
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="exemple@email.com"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.mot_de_passe && styles.inputError
                  ]}
                  placeholder="Votre mot de passe"
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

            {/* <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity> */}

            <Button
              title={loading ? 'Connexion en cours...' : 'Se connecter'}
              onPress={handleConnexion}
              variant="primary"
              style={styles.submitButton}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator size="large" color={theme.colors.primary[500]} style={styles.loader} />
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Vous n'avez pas de compte ? </Text>
              <TouchableOpacity onPress={handleInscription}>
                <Text style={styles.linkText}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {toastVisible && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onHide={() => setToastVisible(false)}
        />
      )}
    </View>
  );
}