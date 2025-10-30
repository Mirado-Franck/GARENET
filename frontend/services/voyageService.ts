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

export const voyageService = {
  getAllVoyages: async (): Promise<Voyage[]> => {
    try {
      const response = await api.get('/voyages');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages:', error);
      throw error;
    }
  },

  getVoyagesByCooperative: async (cooperativeId: number): Promise<Voyage[]> => {
    try {
      const response = await api.get(`/voyages/cooperative/${cooperativeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages par coopérative:', error);
      throw error;
    }
  },

  getPlacesByVoyage: async (voyageId: number): Promise<PlacesResponse> => {
    try {
      const response = await api.get(`/voyages/${voyageId}/places`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des places:', error);
      throw error;
    }
  },

  // MODIFIÉ : Recherche simplifiée par query
  searchVoyages: async (query: string): Promise<Voyage[]> => {
    try {
      if (!query || query.trim() === '') {
        return [];
      }
      
      const response = await api.get(`/voyages/search`, {
        params: { query: query.trim() }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de voyages:', error);
      throw error;
    }
  },
};