import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// ✅ Configuration de l'URL de base (Racine du serveur)
const SERVER_URL = Platform.OS === 'android'
    ? 'http://192.168.224.170:3000'
    : 'http://localhost:3000';

// ✅ Export des URLs pour l'API et les Images
export const API_URL = `${SERVER_URL}/api`;
export const UPLOADS_URL = `${SERVER_URL}/uploads`; // Pour les images

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('🔴 Erreur 401 : Token invalide ou expiré');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('utilisateur');
      router.replace('/se-connecter');
      return Promise.reject(error);
    }

    if (status === 403) {
      console.error('🟡 Erreur 403 : Accès refusé');
      return Promise.reject(error);
    }

    console.error('❌ Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);