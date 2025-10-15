// app/inscription.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/ui/Button';  // ← IMPORT CORRIGÉ

export default function Inscription() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // ← ÉTAT LOADING AJOUTÉ
  const router = useRouter();

  const handleSignUp = async () => {
    setIsLoading(true);  // ← DÉMARRER LE LOADING
    
    // Validation
    if (!nom || !prenom || !email || !telephone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Email invalide');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    // Simulation d'inscription
    setTimeout(() => {
      Alert.alert('Succès', 'Compte créé avec succès !');
      setIsLoading(false);
      console.log('Inscription:', { nom, prenom, email, telephone, password });
      router.back();
    }, 1500);
  };

  const goToConnexion = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Créer un compte</Text>

        {/* Nom et Prénom */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              value={nom}
              onChangeText={setNom}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              value={prenom}
              onChangeText={setPrenom}
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Téléphone */}
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={styles.input}
          placeholder="+261 34 12 345 67"
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />

        {/* Mot de passe */}
        <Text style={styles.label}>Mot de passe *</Text>
        <TextInput
          style={styles.input}
          placeholder="Au moins 6 caractères"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Confirmation mot de passe */}
        <Text style={styles.label}>Confirmer le mot de passe *</Text>
        <TextInput
          style={styles.input}
          placeholder="Retapez votre mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* BOUTON RÉUTILISABLE */}
        <Button 
          title="S'inscrire" 
          onPress={handleSignUp} 
          variant="primary"
          loading={isLoading}
          style={styles.signupButton}
        />

        {/* Lien vers connexion */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte ? </Text>
          <Button 
            title="Se connecter" 
            onPress={goToConnexion} 
            variant="secondary"
            style={styles.loginButton}
          />
        </View>

        <Text style={styles.requiredHint}>* Champs obligatoires</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8fff8',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
  signupButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  requiredHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});