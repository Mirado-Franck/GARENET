// app/(client)/notification.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Types pour les notifications
type NotificationType = 'reservation' | 'promotion' | 'system' | 'alerte';

interface Notification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: string;
  lue: boolean;
  action?: string;
}

export default function Notification() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      titre: 'Réservation confirmée',
      message: 'Votre réservation pour Antananarivo - Toamasina a été confirmée. Numéro de réservation: RES20241215001',
      type: 'reservation',
      date: '2024-12-15T10:30:00',
      lue: false,
      action: 'Voir détails'
    },
    {
      id: '2',
      titre: 'Promotion spéciale',
      message: 'Profitez de -20% sur tous les voyages vers Mahajanga ce week-end !',
      type: 'promotion',
      date: '2024-12-14T14:20:00',
      lue: false,
      action: 'Découvrir'
    },
    {
      id: '3',
      titre: 'Alerte départ',
      message: 'Votre voyage pour Antsirabe part dans 1 heure. Présentez-vous à la gare 30 minutes avant le départ.',
      type: 'alerte',
      date: '2024-12-14T09:15:00',
      lue: true,
      action: 'Itinéraire'
    },
    {
      id: '4',
      titre: 'Maintenance système',
      message: 'Une maintenance est prévue ce soir de 22h à 23h. Le service pourra être temporairement indisponible.',
      type: 'system',
      date: '2024-12-13T16:45:00',
      lue: true
    },
    {
      id: '5',
      titre: 'Paiement reçu',
      message: 'Votre paiement de 25.000 Ar a été confirmé. Merci pour votre confiance !',
      type: 'reservation',
      date: '2024-12-13T11:20:00',
      lue: true
    },
    {
      id: '6',
      titre: 'Nouvelle destination',
      message: 'Découvrez notre nouvelle liaison Fianarantsoa - Tuléar avec des prix promotionnels !',
      type: 'promotion',
      date: '2024-12-12T08:30:00',
      lue: true,
      action: 'Explorer'
    },
    {
      id: '7',
      titre: 'Retard annoncé',
      message: 'Votre bus pour Toamasina aura 15 minutes de retard en raison des conditions météo.',
      type: 'alerte',
      date: '2024-12-11T17:30:00',
      lue: true
    }
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simuler un rechargement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const marquerCommeLue = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, lue: true } : notif
      )
    );
  };

  const marquerToutesCommeLues = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, lue: true }))
    );
  };

  const supprimerNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIconByType = (type: NotificationType) => {
    switch (type) {
      case 'reservation':
        return 'ticket';
      case 'promotion':
        return 'pricetag';
      case 'system':
        return 'settings';
      case 'alerte':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getColorByType = (type: NotificationType) => {
    switch (type) {
      case 'reservation':
        return '#4CAF50';
      case 'promotion':
        return '#FF9800';
      case 'system':
        return '#2196F3';
      case 'alerte':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const notificationsNonLues = notifications.filter(notif => !notif.lue).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notificationsNonLues > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationsNonLues}</Text>
          </View>
        )}
      </View>

      {/* Actions rapides */}
      {notificationsNonLues > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={marquerToutesCommeLues}
          >
            <Ionicons name="checkmark-done" size={16} color="#2E7D32" />
            <Text style={styles.actionText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des notifications */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={60} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
              Vous serez notifié des nouvelles réservations, promotions et alertes
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <View 
                key={notification.id} 
                style={[
                  styles.notificationCard,
                  !notification.lue && styles.notificationNonLue
                ]}
              >
                {/* Indicateur de non-lu */}
                {!notification.lue && (
                  <View style={styles.unreadIndicator} />
                )}

                {/* Icône */}
                <View 
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${getColorByType(notification.type)}20` }
                  ]}
                >
                  <Ionicons 
                    name={getIconByType(notification.type)} 
                    size={20} 
                    color={getColorByType(notification.type)} 
                  />
                </View>

                {/* Contenu */}
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      {notification.titre}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatDate(notification.date)}
                    </Text>
                  </View>
                  
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>

                  {notification.action && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => marquerCommeLue(notification.id)}
                    >
                      <Text style={styles.actionLink}>
                        {notification.action}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Bouton suppression */}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => supprimerNotification(notification.id)}
                >
                  <Ionicons name="close" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  notificationNonLue: {
    backgroundColor: '#F8FFF8',
    borderColor: '#E8F5E8',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionLink: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});