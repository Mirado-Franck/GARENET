import { api } from './api';

export interface Paiement {
  id: number;
  code_paiement: string;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  status: string;
  reservation: {
    code_reservation: string;
    voyage: {
      date_depart: string;
      trajet: {
        station_depart: string;
        station_arrivee: string;
      };
      cooperative: {
        nom: string;
      };
    };
  };
}

export const paiementService = {
  /**
   * Récupérer l'historique des paiements
   */
  getMyPaiements: async (): Promise<Paiement[]> => {
    try {
      const response = await api.get<Paiement[]>('/paiements');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération paiements:', error);
      throw error.response?.data || { error: 'Impossible de récupérer les paiements' };
    }
  }
};