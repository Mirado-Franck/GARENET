// app/se-connecter.tsx
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
import { useAuth } from '../contexts/AuthContext';

export default function SeConnecter() {
  const router = useRouter();
  const { login, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

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

  const handleConnexion = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.mot_de_passe);
      
      // ✅ NOUVEAU : Gestion de la redirection
      if (redirectAfterLogin) {
        console.log('🔀 Redirection vers:', redirectAfterLogin);
        showToast('Connexion réussi');
        const path = redirectAfterLogin;
        setRedirectAfterLogin(null); // Nettoyer la redirection
        router.replace(path as any);
      } else {
        console.log('🏠 Redirection vers home');
        router.replace('/(client)/home');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      Alert.alert(
        'Erreur de connexion',
        error.error || 'Une erreur est survenue lors de la connexion'
      );
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
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.mot_de_passe && (
              <Text style={styles.errorText}>{errors.mot_de_passe}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title={loading ? 'Connexion en cours...' : 'Se connecter'}
            onPress={handleConnexion}
            variant="primary"
            style={styles.submitButton}
            disabled={loading}
          />

          {loading && (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
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
  );
}

// Styles identiques à avant...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1.5,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  loader: {
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

function showToast(arg0: string) {
  throw new Error('Function not implemented.');
}
