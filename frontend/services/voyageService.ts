// frontend/services/voyageService.ts
import { api } from './api';

export interface Voyage {
  id: number;
  code_voyage: string;
  date_depart: string;
  heure_depart: string | null;
  prix: number;
  status: string;
  code_trajet_id: number;
  code_cooperative_id: number;
  code_voiture_id: number;
  code_chauffeur_id: number;
  
  trajet: {
    id: number;
    code_trajet: string;
    station_depart: string;
    station_arrivee: string;
    distance: number;
    status: string;
  };
  
  voiture: {
    id: number;
    immatriculation: string;
    modele: string;
    capacite: number;
    disponibilite: string;
    etat_technique: string;
  };
  
  chauffeur: {
    id: number;
    code_chauffeur: string;
    nom: string;
    telephone: number;
  };
  
  cooperative: {
    id: number;
    code_cooperative: string;
    nom: string;
    adresse: string | null;
    contact: string | null;
    logo: string | null;
  };
}

export interface Place {
  numero: string;
  est_reserve: boolean;
  est_chauffeur: boolean;
  selectionnable: boolean;
}

export interface PlacesResponse {
  voyageId: number;
  code_voyage: string;
  voiture: string;
  capacite: number;
  places: Place[];
}

export interface PlacesVoyageResponse {
  voyageId: number;
  code_voyage: string;
  voiture: string;
  capacite: number;
  places: Place[];
}

// ✨ NOUVEAU : Interface pour les filtres
export interface VoyageFilterParams {
  date?: string; // Format: YYYY-MM-DD
  status?: 'disponible' | 'termine' | 'tous';
}

export const voyageService = {
  /**
   * Récupérer tous les voyages
   */
  getAllVoyages: async (): Promise<Voyage[]> => {
    try {
      const response = await api.get('/voyages');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages:', error);
      throw error;
    }
  },

  /**
   * Récupérer les places disponibles d'un voyage
   */
  getPlacesByVoyage: async (voyageId: number): Promise<PlacesVoyageResponse> => {
    try {
      const response = await api.get(`/voyages/${voyageId}/places`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des places:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération des places' };
    }
  },

  /**
   * Récupérer les voyages d'une coopérative
   */
  getVoyagesByCooperative: async (cooperativeId: number): Promise<Voyage[]> => {
    try {
      const response = await api.get(`/voyages/cooperative/${cooperativeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages par coopérative:', error);
      throw error;
    }
  },

  /**
   * ✨ NOUVEAU : Filtrer les voyages d'une coopérative par date et status
   */
  filterVoyagesByCooperative: async (
    cooperativeId: number,
    filters: VoyageFilterParams
  ): Promise<Voyage[]> => {
    try {
      const params: any = {};

      // Ajouter la date si fournie
      if (filters.date) {
        params.date = filters.date;
      }

      // Ajouter le status si fourni et différent de "tous"
      if (filters.status && filters.status !== 'tous') {
        params.status = filters.status;
      }

      console.log('🔍 Filtrage avec params:', params);

      const response = await api.get(`/voyages/cooperative/${cooperativeId}/filter`, {
        params,
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du filtrage des voyages:', error);
      throw error;
    }
  },

  /**
   * Récupérer un voyage par ID avec tous ses détails
   */
  getVoyageById: async (id: number): Promise<Voyage> => {
    try {
      const response = await api.get(`/voyages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du voyage:', error);
      throw error;
    }
  },

  /**
   * Recherche simplifiée par query
   */
  searchVoyages: async (query: string): Promise<Voyage[]> => {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const response = await api.get(`/voyages/search`, {
        params: { query: query.trim() },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de voyages:', error);
      throw error;
    }
  },
};