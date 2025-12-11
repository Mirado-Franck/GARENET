// frontend/services/notificationService.ts
import { api } from './api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

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

// ==========================================
// CONFIGURATION DES NOTIFICATIONS PUSH
// ==========================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // 👈 ajouté
    shouldShowList: true,   // 👈 ajouté
  }),
});

// ==========================================
// FONCTIONS NOTIFICATIONS PUSH
// ==========================================

/**
 * Enregistrer l'appareil pour recevoir des notifications push
 */
export const registerForPushNotifications = async () => {
  try {
    // Vérifier si on est sur un device physique
    if (!Device.isDevice) {
      console.log('⚠️ Les notifications push nécessitent un appareil physique');
      return null;
    }

    // Demander les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permission notifications refusée');
      return null;
    }

    // Configuration du canal Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications Garnet',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }

    // Obtenir le token Expo Push
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    console.log('📱 Push Token obtenu:', token.data);
    return token.data;
    
  } catch (error) {
    console.error('❌ Erreur registration push:', error);
    return null;
  }
};

/**
 * Sauvegarder le token push dans le backend
 */
export const savePushToken = async (userId: number, token: string) => {
  try {
    const response = await api.put(`/utilisateurs/${userId}/push-token`, { 
      push_token: token 
    });
    console.log('✅ Token push sauvegardé dans le backend');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur sauvegarde token:', error);
    throw error;
  }
};

// ==========================================
// SERVICE NOTIFICATIONS API (existant)
// ==========================================

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