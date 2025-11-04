/**
 * Service de gestion des avis
 */

import { api } from './api';

export interface Avis {
  id: number;
  note: number;
  commentaire: string;
  date_avis: string;
  client: {
    nom_complet: string;
    photo: string | null;
  };
  voyage: {
    code: string;
    trajet: string;
    date: string;
  };
}

export interface AvisResponse {
  count: number;
  avis: Avis[];
}

export const avisService = {
  /**
   * Récupérer les avis les plus récents
   */
  getLatestAvis: async (limit: number = 5): Promise<AvisResponse> => {
    try {
      const response = await api.get(`/avis?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des avis:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération des avis' };
    }
  },
};