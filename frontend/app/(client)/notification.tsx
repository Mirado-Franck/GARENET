// app/(client)/notification.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService, Notification } from '../../services/notificationService';
import { useTheme } from '../../contexts/ThemeContext';

type NotificationType = 'reservation' | 'promotion' | 'system' | 'alerte';

export default function NotificationPage() {
  const router = useRouter();
  const { theme } = useTheme(); // 👈 dynamique
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.secondary,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background.secondary,
        },
        loadingText: {
          marginTop: theme.spacing.md,
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.secondary,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.xl,
          paddingTop: 50,
          paddingBottom: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral[200],
        },
        backButton: {
          marginRight: theme.spacing.lg,
        },
        headerTitle: {
          fontSize: theme.typography.sizes.h2,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.primary[500],
          flex: 1,
        },
        badge: {
          backgroundColor: theme.colors.semantic.error,
          borderRadius: 12,
          minWidth: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
        },
        badgeText: {
          color: theme.colors.text.inverse,
          fontSize: 12,
          fontWeight: theme.typography.weights.bold,
        },
        actionsContainer: {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral[200],
        },
        actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        actionText: {
          color: theme.colors.primary[500],
          fontSize: theme.typography.sizes.caption,
          fontWeight: theme.typography.weights.semibold,
        },
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingBottom: theme.spacing.xl,
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xxxl,
          paddingVertical: 100,
        },
        emptyTitle: {
          fontSize: theme.typography.sizes.h2,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
        emptyText: {
          fontSize: theme.typography.sizes.body,
          color: theme.colors.text.tertiary,
          textAlign: 'center',
          lineHeight: 22,
        },
        notificationsList: {
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        notificationCard: {
          flexDirection: 'row',
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.neutral[200],
          position: 'relative',
          ...theme.shadows.sm,
        },
        notificationNonLue: {
          backgroundColor: theme.colors.primary[50],
          borderColor: theme.colors.primary[200],
        },
        unreadIndicator: {
          position: 'absolute',
          left: 8,
          top: '50%',
          marginTop: -4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.primary[500],
        },
        iconContainer: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        notificationContent: {
          flex: 1,
        },
        notificationHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        },
        notificationTitle: {
          fontSize: theme.typography.sizes.body,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
          flex: 1,
          marginRight: theme.spacing.md,
          textTransform: 'capitalize',
        },
        notificationDate: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.tertiary,
        },
        notificationMessage: {
          fontSize: theme.typography.sizes.caption,
          color: theme.colors.text.secondary,
          lineHeight: 20,
          marginBottom: theme.spacing.sm,
        },
        canalBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.neutral[100],
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
        },
        canalText: {
          fontSize: theme.typography.sizes.small,
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
        },
        deleteButton: {
          padding: theme.spacing.xs,
          marginLeft: theme.spacing.sm,
        },
      }),
    [theme]
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const marquerCommeLue = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, statut: 'lu' } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const marquerToutesCommeLues = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, statut: 'lu' as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      Alert.alert('Erreur', 'Impossible de marquer toutes les notifications');
    }
  };

  const supprimerNotification = async (id: number) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              
              const notifToDelete = notifications.find(n => n.id === id);
              if (notifToDelete && notifToDelete.statut === 'non_lu') {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
              
              setNotifications(prev => prev.filter(notif => notif.id !== id));
            } catch (error) {
              console.error('Erreur suppression notification:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la notification');
            }
          },
        },
      ]
    );
  };

  const getIconByType = (type: string): keyof typeof Ionicons.glyphMap => {
    const typeMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      reservation_confirmee: 'ticket',
      paiement_valide: 'card',
      voyage_annule: 'close-circle',
      rappel_voyage: 'time',
      modification_voyage: 'create',
      avis_demande: 'star',
      promotion: 'pricetag',
      system: 'settings',
      alerte: 'warning',
    };
    return typeMap[type] || 'notifications';
  };

  const getColorByType = (type: string): string => {
    const colorMap: Record<string, string> = {
      reservation_confirmee: theme.colors.semantic.success,
      paiement_valide: theme.colors.semantic.success,
      voyage_annule: theme.colors.semantic.error,
      rappel_voyage: theme.colors.semantic.warning,
      modification_voyage: theme.colors.semantic.info,
      avis_demande: '#FFB800',
      promotion: theme.colors.secondary[500],
      system: theme.colors.primary[500],
      alerte: theme.colors.semantic.error,
    };
    return colorMap[type] || theme.colors.neutral[500];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary[500]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={marquerToutesCommeLues}>
            <Ionicons name="checkmark-done" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.actionText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.primary[500]]} 
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={80} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
              Vous serez notifié des nouvelles réservations, promotions et alertes
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.statut === 'non_lu' && styles.notificationNonLue,
                ]}
                onPress={() => {
                  if (notification.statut === 'non_lu') {
                    marquerCommeLue(notification.id);
                  }
                }}
                activeOpacity={0.7}
              >
                {notification.statut === 'non_lu' && <View style={styles.unreadIndicator} />}

                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${getColorByType(notification.type)}20` },
                  ]}
                >
                  <Ionicons
                    name={getIconByType(notification.type)}
                    size={22}
                    color={getColorByType(notification.type)}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      {notification.type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatDate(notification.date_envoi)}
                    </Text>
                  </View>

                  <Text style={styles.notificationMessage}>{notification.contenu}</Text>

                  <View style={styles.canalBadge}>
                    <Ionicons
                      name={
                        notification.canal === 'email'
                          ? 'mail'
                          : notification.canal === 'push'
                          ? 'notifications'
                          : 'phone-portrait'
                      }
                      size={12}
                      color={theme.colors.neutral[500]}
                    />
                    <Text style={styles.canalText}>{notification.canal}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    supprimerNotification(notification.id);
                  }}
                >
                  <Ionicons name="close" size={20} color={theme.colors.neutral[400]} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}