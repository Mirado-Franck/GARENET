// frontend/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Configuration de l'URL de base
const API_URL = Platform.OS === 'android'
    ? 'http://192.168.1.232:3000/api'
    : 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token ajouté aux headers:', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Intercepteur pour gérer les erreurs globalement (MODIFICATION IMPORTANTE)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // 🔴 Gestion des erreurs 401 (token invalide/expiré)
    if (status === 401) {
      console.error('🔴 Erreur 401 : Token invalide ou expiré');
      
      // Nettoyer les données d'authentification
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('utilisateur');
      
      console.log('🚪 Déconnexion automatique et redirection vers login');
      
      // Rediriger vers la page de connexion
      router.replace('/se-connecter');
      
      // 🔥 CHANGEMENT : Rejeter l'erreur originale pour que le service puisse la traiter
      return Promise.reject(error);
    }

    // 🟡 Gestion des erreurs 403 (accès refusé)
    if (status === 403) {
      console.error('🟡 Erreur 403 : Accès refusé');
      // 🔥 CHANGEMENT : Rejeter l'erreur originale
      return Promise.reject(error);
    }

    // ⚪ Autres erreurs
    console.error('❌ Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);