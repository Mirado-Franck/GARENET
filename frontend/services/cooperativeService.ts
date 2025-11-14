// services/cooperativeService.ts
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

export interface CooperativeDetail extends Cooperative {
  date_inscription?: string;
  stations?: any[];
  voitures?: any[];
  responsables?: any[];
  prochains_voyages?: any[];
}

export interface CooperativesResponse {
  cooperatives: Cooperative[];
  total: number;
}

// ✨ NOUVEAU : Interface pour la moyenne des avis
export interface MoyenneAvisResponse {
  cooperative_id: number;
  cooperative_nom: string;
  nombre_avis: number;
  note_moyenne: number;
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

  /**
   * Récupérer les détails d'une coopérative par ID
   */
  getCooperativeById: async (id: number): Promise<CooperativeDetail> => {
    try {
      const response = await api.get(`/cooperatives/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la coopérative:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération de la coopérative' };
    }
  },

  /**
   * ✨ NOUVELLE FONCTION : Récupérer la note moyenne d'une coopérative
   */
  getMoyenneAvis: async (id: number): Promise<MoyenneAvisResponse> => {
    try {
      const response = await api.get(`/cooperatives/${id}/moyenne`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la moyenne des avis:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération de la moyenne' };
    }
  },
};