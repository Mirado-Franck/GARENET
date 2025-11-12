/**
 * Service de gestion des utilisateurs
 */
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Utilisateur {
  id: number;
  ref_utilisateur: string;
  nom: string;
  prenoms: string | null;
  email: string | null;
  telephone: string;
  statut_compte: string;
  role: string;
  type_utilisateur: string;
  date_creation_compte: string;
  photo_identite: string | null;
}

export interface InscriptionData {
  nom: string;
  prenoms?: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
}

export interface ConnexionData {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  message: string;
  utilisateur: Utilisateur;
  token?: string;
  error?: string; // 👈 AJOUTÉ
}

export const utilisateurService = {
  /**
   * Inscription d'un nouveau client
   */
  inscription: async (data: InscriptionData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/utilisateurs/register', data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error.response?.data || { error: 'Erreur lors de l\'inscription' };
    }
  },

    /**
   * Connexion d'un utilisateur existant - CORRIGÉ
   */
  connexion: async (data: ConnexionData): Promise<AuthResponse> => {
    try {
      console.log('🔄 Tentative de connexion avec:', data.email);
      
      const response = await api.post('/utilisateurs/login', data);
      
      console.log('✅ Réponse du backend:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        console.log('🔐 Token JWT sauvegardé');
      }

      await AsyncStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));
      console.log('👤 Utilisateur sauvegardé:', response.data.utilisateur.email);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error.response?.data || error);
      
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response?.status === 403) {
        errorMessage = error.response.data.error || 'Compte désactivé';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      // 🔥 CHANGEMENT IMPORTANT : Lancer une exception au lieu de retourner un objet
      throw new Error(errorMessage);
    }
  },

  /**
   * Déconnexion
   */
  deconnexion: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('utilisateur');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  /**
   * Récupérer l'utilisateur connecté depuis le stockage local
   */
  getUtilisateurConnecte: async (): Promise<Utilisateur | null> => {
    try {
      const utilisateurJson = await AsyncStorage.getItem('utilisateur');
      return utilisateurJson ? JSON.parse(utilisateurJson) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isConnecte: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const utilisateur = await AsyncStorage.getItem('utilisateur');
      return token !== null && utilisateur !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Récupérer le token JWT
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },
};