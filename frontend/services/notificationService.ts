// frontend/services/notificationService.ts
import { api } from './api';

export interface Notification {
  id: number;
  ref_notification: string;
  ref_utilisateur_id: number;
  type: string;
  contenu: string;
  date_envoi: string;
  statut: 'lu' | 'non_lu';
  canal: 'app' | 'email' | 'push';
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  /**
   * Récupérer toutes les notifications de l'utilisateur
   */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error.response?.data || { error: 'Erreur lors de la récupération des notifications' };
    }
  },

  /**
   * Compter les notifications non lues
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
      return response.data.count;
    } catch (error: any) {
      console.error('❌ Erreur comptage notifications:', error);
      return 0;
    }
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      console.log('✅ Notification marquée comme lue');
    } catch (error: any) {
      console.error('❌ Erreur marquage notification:', error);
      throw error.response?.data || { error: 'Erreur lors du marquage' };
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      const response = await api.put('/notifications/read-all');
      console.log(`✅ ${response.data.count} notification(s) marquée(s) comme lue(s)`);
    } catch (error: any) {
      console.error('❌ Erreur marquage toutes notifications:', error);
      throw error.response?.data || { error: 'Erreur lors du marquage' };
    }
  },

  /**
   * Supprimer une notification
   */
  deleteNotification: async (notificationId: number): Promise<void> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      console.log('✅ Notification supprimée');
    } catch (error: any) {
      console.error('❌ Erreur suppression notification:', error);
      throw error.response?.data || { error: 'Erreur lors de la suppression' };
    }
  },

  /**
   * Créer une notification (usage interne)
   */
  createNotification: async (
    userId: number,
    type: string,
    contenu: string,
    canal: 'app' | 'email' | 'push' = 'app'
  ): Promise<Notification> => {
    try {
      const response = await api.post('/notifications', {
        ref_utilisateur_id: userId,
        type,
        contenu,
        canal,
      });
      return response.data.notification;
    } catch (error: any) {
      console.error('❌ Erreur création notification:', error);
      throw error.response?.data || { error: 'Erreur lors de la création' };
    }
  },
};