// frontend/services/avisService.ts
import { api } from './api';

export interface Avis {
  id: number;
  code_voyage_id: number;
  code_client_id: number;
  ref_avis: string;
  note: number;
  commentaire: string | null;
  date_avis: string;
  client?: {
    utilisateur: {
      nom: string;
      prenoms: string | null;
      photo_identite: string | null;
    };
  };
}

export interface AvisResponse {
  success: boolean;
  message: string;
  avis: Avis;
}

export interface AvisListResponse {
  avis: Avis[];
  count: number;
  moyenne: number;
}

export const avisService = {
  /**
   * ⭐ Créer un avis pour un voyage terminé
   */
  createAvis: async (
    voyageId: number,
    note: number,
    commentaire?: string
  ): Promise<AvisResponse> => {
    try {
      console.log('📤 Envoi avis:', { voyageId, note, commentaire });
      
      const response = await api.post<AvisResponse>('/avis', {
        code_voyage_id: voyageId,
        note,
        commentaire: commentaire?.trim() || null,
      });

      console.log('✅ Avis créé:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur création avis:', error.response?.data || error.message);
      
      // Gérer les erreurs spécifiques
      if (error.response?.status === 409) {
        throw new Error('Vous avez déjà donné votre avis pour ce voyage');
      }
      if (error.response?.status === 403) {
        throw new Error('Vous devez avoir effectué ce voyage pour donner un avis');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Données invalides');
      }
      
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'avis');
    }
  },

  /**
   * 📋 Récupérer tous les avis d'un voyage
   */
  getAvisByVoyage: async (voyageId: number): Promise<AvisListResponse> => {
    try {
      const response = await api.get<AvisListResponse>(`/avis/voyage/${voyageId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération avis:', error);
      throw new Error('Impossible de charger les avis');
    }
  },

  /**
   * 🆕 Récupérer les derniers avis (global)
   */
  getLatestAvis: async (limit: number = 10) => {
    try {
      const response = await api.get('/avis/avis', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération derniers avis:', error);
      throw new Error('Impossible de charger les avis');
    }
  },
};