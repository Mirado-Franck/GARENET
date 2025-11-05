/**
 * Service de gestion des réservations
 */

import { api } from './api';

export interface Place {
  numero: string;
  est_reserve: boolean;
  est_chauffeur: boolean;
  selectionnable: boolean;
}

export interface PlacesVoyageResponse {
  voyageId: number;
  code_voyage: string;
  voiture: string;
  capacite: number;
  places: Place[];
}

export interface CreateReservationData {
  code_voyage_id: number;
  places: string[]; // ["A1", "B3", "C2"]
}

export interface Reservation {
  id: number;
  code_reservation: string;
  date_reservation: string;
  statut: string;
  nombre_places: number;
  places: string[];
  voyage: {
    code: string;
    trajet: string;
    date_depart: string;
    prix: number;
  };
  client: {
    nom: string;
    prenoms: string;
    email: string;
  };
}

export interface ReservationResponse {
  message: string;
  reservation: Reservation;
}

export const reservationService = {
  /**
   * Créer une réservation
   */
  createReservation: async (data: CreateReservationData): Promise<ReservationResponse> => {
    try {
      const response = await api.post('/reservations', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw error.response?.data || { error: 'Erreur lors de la création de la réservation' };
    }
  },

  /**
   * Récupérer les réservations de l'utilisateur connecté
   */
  getMyReservations: async (): Promise<Reservation[]> => {
    try {
      const response = await api.get('/reservations');
      return response.data.reservations || response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération des réservations' };
    }
  },

  /**
   * Annuler une réservation
   */
  cancelReservation: async (reservationId: number): Promise<void> => {
    try {
      await api.put(`/reservations/${reservationId}/cancel`);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      throw error.response?.data || { error: 'Erreur lors de l\'annulation' };
    }
  },
};