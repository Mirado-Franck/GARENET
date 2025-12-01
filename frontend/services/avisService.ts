// frontend/services/avisService.ts
import { api } from './api';

// ==========================================
// INTERFACES
// ==========================================

// Interface pour un avis brut depuis la BD
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

// Interface pour un avis formaté (coopérative)
export interface AvisFormatted {
  id: number;
  ref_avis: string;
  note: number;
  commentaire: string | null;
  date_creation: string;
  client: {
    nom: string;
    prenom: string;
    photo: string | null;
  };
  voyage: {
    id: number;
    code: string;
    date: string;
    trajet: string | null;
  } | null;
}

// Interface pour un avis global formaté
export interface AvisGlobal {
  id: number;
  note: number;
  commentaire: string | null;
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

// Réponse de création d'avis
export interface CreateAvisResponse {
  success: boolean;
  message: string;
  avis: Avis;
}

// Réponse liste d'avis par voyage
export interface AvisVoyageResponse {
  avis: Avis[];
  count: number;
  moyenne: number;
}

// Réponse liste d'avis globaux
export interface AvisGlobalResponse {
  count: number;
  avis: AvisGlobal[];
}

// 👇 NOUVELLE INTERFACE : Réponse pour les avis d'une coopérative
export interface AvisCooperativeResponse {
  avis: AvisFormatted[];
  count: number;
  moyenne: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Interface pour la création d'avis
export interface CreateAvisInput {
  voyageId: number;
  note: number;
  commentaire?: string;
}

// ==========================================
// SERVICE
// ==========================================

export const avisService = {
  /**
   * ⭐ Créer un avis pour un voyage terminé
   * @param voyageId - ID du voyage
   * @param note - Note de 1 à 5
   * @param commentaire - Commentaire optionnel
   * @returns Promise<CreateAvisResponse>
   */
  createAvis: async (
    voyageId: number,
    note: number,
    commentaire?: string
  ): Promise<CreateAvisResponse> => {
    try {
      console.log('📤 Création avis:', { voyageId, note, commentaire });
      
      // Validation côté client
      if (note < 1 || note > 5) {
        throw new Error('La note doit être entre 1 et 5');
      }
      
      const response = await api.post<CreateAvisResponse>('/avis', {
        code_voyage_id: voyageId,
        note,
        commentaire: commentaire?.trim() || null,
      });

      console.log('✅ Avis créé avec succès:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur création avis:', error.response?.data || error.message);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 409) {
        throw new Error('Vous avez déjà donné votre avis pour ce voyage');
      }
      if (error.response?.status === 403) {
        throw new Error('Vous devez avoir effectué ce voyage pour donner un avis');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Données invalides');
      }
      if (error.response?.status === 401) {
        throw new Error('Vous devez être connecté pour donner un avis');
      }
      
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'avis');
    }
  },

  /**
   * 📋 Récupérer tous les avis d'un voyage spécifique
   * @param voyageId - ID du voyage
   * @returns Promise<AvisVoyageResponse>
   */
  getAvisByVoyage: async (voyageId: number): Promise<AvisVoyageResponse> => {
    try {
      console.log('📤 Récupération avis du voyage:', voyageId);
      
      const response = await api.get<AvisVoyageResponse>(`/avis/voyage/${voyageId}`);
      
      console.log(`✅ ${response.data.count} avis récupérés`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération avis voyage:', error);
      
      // Retourner une réponse vide en cas d'erreur
      return {
        avis: [],
        count: 0,
        moyenne: 0
      };
    }
  },

  /**
   * 🆕 Récupérer les derniers avis (tous confondus)
   * @param limit - Nombre d'avis à récupérer
   * @returns Promise<AvisGlobalResponse>
   */
  getLatestAvis: async (limit: number = 10): Promise<AvisGlobalResponse> => {
    try {
      console.log('📤 Récupération des', limit, 'derniers avis');
      
      const response = await api.get<AvisGlobalResponse>('/avis/avis', {
        params: { limit }
      });
      
      console.log(`✅ ${response.data.count} avis récupérés`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération derniers avis:', error);
      
      return {
        count: 0,
        avis: []
      };
    }
  },

  /**
   * 🏢 Récupérer tous les avis d'une coopérative
   * @param cooperativeId - ID de la coopérative
   * @param limit - Nombre maximum d'avis (défaut: 50)
   * @returns Promise<AvisCooperativeResponse>
   */
  getAvisByCooperative: async (
    cooperativeId: number, 
    limit: number = 50
  ): Promise<AvisCooperativeResponse> => {
    try {
      console.log('📤 Récupération avis coopérative:', cooperativeId);
      
      const response = await api.get<AvisCooperativeResponse>(
        `/avis/cooperative/${cooperativeId}`,
        { params: { limit } }
      );
      
      console.log(`✅ Coopérative ${cooperativeId}:`, {
        avis: response.data.count,
        moyenne: response.data.moyenne,
        distribution: response.data.distribution
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération avis coopérative:', error);
      
      // Retourner une réponse vide en cas d'erreur pour ne pas bloquer l'UI
      return {
        avis: [],
        count: 0,
        moyenne: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  },

  /**
   * 🔍 Vérifier si un client peut donner un avis
   * @param voyageId - ID du voyage
   * @returns Promise<boolean>
   */
  canGiveReview: async (voyageId: number): Promise<boolean> => {
    try {
      // Tu peux créer une route backend pour vérifier ça
      // Pour l'instant on retourne true
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * 📊 Calculer des statistiques locales à partir d'une liste d'avis
   * @param avis - Liste d'avis
   * @returns Statistiques calculées
   */
  calculateStats: (avis: AvisFormatted[]) => {
    if (avis.length === 0) {
      return {
        moyenne: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    avis.forEach(a => {
      const note = Math.round(a.note);
      if (note >= 1 && note <= 5) {
        distribution[note]++;
        sum += a.note;
      }
    });

    const percentages: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round((distribution[i] / avis.length) * 100);
    }

    return {
      moyenne: parseFloat((sum / avis.length).toFixed(2)),
      total: avis.length,
      distribution,
      percentages
    };
  },

  /**
   * ⭐ Formatter la note en étoiles
   * @param note - Note de 1 à 5
   * @returns String d'étoiles
   */
  formatStars: (note: number): string => {
    const rounded = Math.round(note);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  },

  /**
   * 📅 Formatter la date d'un avis
   * @param dateString - Date en string
   * @returns Date formatée
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
};

// Export par défaut pour faciliter l'import
export default avisService;