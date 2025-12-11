// frontend/services/utilisateurService.ts
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

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
  dernier_acces?: string | null;
}

export interface InscriptionData {
  nom: string;
  prenoms?: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
}

export interface UpdateProfileData {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
}

export interface ChangePasswordData {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface ConnexionData {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  message: string;
  utilisateur: Utilisateur;
  token?: string;
}

export const utilisateurService = {
  /**
   * ✨ INSCRIPTION AVEC PHOTO
   */
  inscription: async (data: InscriptionData, photoUri?: string): Promise<AuthResponse> => {
    try {
      const formData = new FormData();
      
      // Ajouter les données texte
      formData.append('nom', data.nom);
      formData.append('email', data.email);
      formData.append('mot_de_passe', data.mot_de_passe);
      formData.append('telephone', data.telephone);
      
      if (data.prenoms) {
        formData.append('prenoms', data.prenoms);
      }

      // ✅ Ajouter la photo si elle existe
      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type: type,
        } as any);
      }

      const response = await api.post('/utilisateurs/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      throw error.response?.data || { error: 'Erreur lors de l\'inscription' };
    }
  },

  /**
   * CONNEXION
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
        
        // 🛑 CORRECTION : Remplacement de console.error par console.log.
        // Cela empêche l'affichage du bandeau rouge/noir (LogBox) en bas de l'écran.
        console.log('❌ Échec de la connexion (Service):', error.response?.data || error); 
        
        let errorMessage = 'Erreur lors de la connexion';
        
        if (error.response?.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.response?.status === 403) {
            errorMessage = error.response.data.error || 'Compte désactivé';
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        }
        
        // Cette ligne est correcte et nécessaire pour déclencher l'Alert native sur la page de login.
        throw new Error(errorMessage);
    }
},

  /**
   * ✨ METTRE À JOUR LE PROFIL AVEC PHOTO
   */
  updateProfile: async (
    userId: number,
    data: UpdateProfileData,
    photoUri?: string
  ): Promise<Utilisateur> => {
    try {
      const formData = new FormData();

      // Ajouter les données texte
      if (data.nom) formData.append('nom', data.nom);
      if (data.prenoms) formData.append('prenoms', data.prenoms);
      if (data.email) formData.append('email', data.email);
      if (data.telephone) formData.append('telephone', data.telephone);

      // ✅ Ajouter la photo si elle existe
      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type: type,
        } as any);
      }

      const response = await api.put(`/utilisateurs/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mettre à jour le stockage local
      await AsyncStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));

      return response.data.utilisateur;
    } catch (error: any) {
      console.error('❌ Erreur update profile:', error);
      throw error.response?.data || { error: 'Erreur lors de la mise à jour' };
    }
  },

  /**
   * ✨ CHANGER LE MOT DE PASSE
   */
  changePassword: async (userId: number, data: ChangePasswordData): Promise<void> => {
    try {
      await api.put(`/utilisateurs/${userId}/password`, data);
    } catch (error: any) {
      console.error('❌ Erreur changement mot de passe:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Ancien mot de passe incorrect');
      }
      
      throw error.response?.data || { error: 'Erreur lors du changement de mot de passe' };
    }
  },

  /**
   * RÉCUPÉRER UN UTILISATEUR PAR ID
   */
  getUtilisateurById: async (id: number): Promise<Utilisateur> => {
    try {
      const response = await api.get(`/utilisateurs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error.response?.data || { error: 'Utilisateur introuvable' };
    }
  },

  /**
   * DÉCONNEXION
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
   * RÉCUPÉRER L'UTILISATEUR CONNECTÉ
   */
  getUtilisateurConnecte: async (): Promise<Utilisateur | null> => {
    try {
      const utilisateurJson = await AsyncStorage.getItem('utilisateur');
      return utilisateurJson ? JSON.parse(utilisateurJson) : null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  },

  /**
   * VÉRIFIER SI CONNECTÉ
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
   * RÉCUPÉRER LE TOKEN
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  },

  /**
   * ✨ HELPER : Obtenir l'URL complète de la photo
   */
  getPhotoUrl: (photoPath: string | null): string | null => {
    if (!photoPath) return null;
    
    // Si c'est déjà une URL complète, la retourner
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    
    // Sinon, construire l'URL avec l'API
    const API_URL = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000';
    return `${API_URL}${photoPath}`;
  },
};