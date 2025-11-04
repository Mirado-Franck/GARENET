/**
 * Service de gestion des coopératives
 */

import { api } from './api';

export interface Cooperative {
  id: number;
  nom: string;
  adresse: string;
  contact: string;
  email: string | null;
  logo: string | null;
  code_cooperative: string;
  statut: string;
  note_moyenne?: number;
}

export interface CooperativesResponse {
  cooperatives: Cooperative[];
  total: number;
}

export const cooperativeService = {
  /**
   * Récupérer toutes les coopératives
   */
  getAllCooperatives: async (): Promise<Cooperative[]> => {
    try {
      const response = await api.get('/cooperatives');
      return response.data.cooperatives || response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des coopératives:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération des coopératives' };
    }
  },
};