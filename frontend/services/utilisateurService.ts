/**
 * Service de gestion des utilisateurs
 * 
 * Rôle :
 * - Gestion de l'authentification (login, inscription, logout)
 * - Gestion du profil utilisateur (récupérer, modifier, supprimer)
 * - Stockage et récupération du token JWT (AsyncStorage)
 * 
 * Utilisé par : se-connecter.tsx, inscription.tsx, profile.tsx, etc.
 */

import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types basés sur votre modèle Prisma
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
  token?: string; // Si vous utilisez JWT
}

export const utilisateurService = {
  /**
   * Inscription d'un nouveau client
   */
  inscription: async (data: InscriptionData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/utilisateurs/register', data);
      
      // Sauvegarder le token si fourni par le backend
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
 * Connexion d'un utilisateur existant
 */
connexion: async (data: ConnexionData): Promise<AuthResponse> => {
  try {
    console.log('🔄 Tentative de connexion avec:', data.email); // Pour déboguer
    
    const response = await api.post('/utilisateurs/login', data);
    
    console.log('✅ Réponse du backend:', response.data); // Pour déboguer
    
    // Sauvegarder les infos utilisateur dans AsyncStorage
    await AsyncStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));
    
    // Si un token est fourni par le backend (plus tard)
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur lors de la connexion:', error.response?.data || error);
    
    // Gestion d'erreur améliorée
    if (error.response?.status === 401) {
      throw { error: 'Email ou mot de passe incorrect' };
    }
    
    if (error.response?.status === 403) {
      throw { error: error.response.data.error || 'Compte désactivé' };
    }
    
    throw error.response?.data || { error: 'Erreur lors de la connexion' };
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
      return token !== null;
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