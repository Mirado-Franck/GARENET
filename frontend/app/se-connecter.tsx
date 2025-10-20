// app/se-connecter.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';

export default function SeConnecter() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    setIsLoading(true);

    // Simulation simple d'une connexion réussie
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Connexion réussie !');

      // Le message disparaît après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);

      // Redirection vers la page client
      router.replace('/(client)');
    }, 1000);
  };

  const goToInscription = () => {
    router.push('/inscription');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Message de succès affiché en haut */}
      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.logo}>🌱 GARENET</Text>
        <Text style={styles.subtitle}>Vos voyages, simplifiés</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Connexion</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Se connecter"
          onPress={handleLogin}
          variant="primary"
          loading={isLoading}
          style={styles.loginButton}
        />

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Pas de compte ? </Text>
          <Button
            title="S'inscrire"
            onPress={goToInscription}
            variant="secondary"
            style={styles.signupButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8fff8',
  },
  successBox: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    zIndex: 10,
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2E7D32',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
});
