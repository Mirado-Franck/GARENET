// app/(client)/_layout.tsx
import React, { useEffect, useRef } from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { registerForPushNotifications, savePushToken } from '../../services/notificationService';

// Supprimer le warning spécifique
LogBox.ignoreLogs([
  'Image: style.resizeMode is deprecated. Please use props.resizeMode.',
]);

export default function ClientLayout() {
  const { theme } = useTheme();
  const { utilisateur, isConnecte } = useAuth();

  // Refs pour les listeners de notifications
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // ========================================
  // 📱 CONFIGURATION DES LISTENERS
  // ========================================
  useEffect(() => {
    // Listener : Notification reçue (app en premier plan)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notification reçue:', notification.request.content);
    });

    // Listener : Utilisateur clique sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response.notification.request.content);
      handleNotificationClick(response.notification.request.content.data);
    });

    // Cleanup
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // ========================================
  // 📱 ENREGISTRER LE PUSH TOKEN (QUAND USER CONNECTÉ)
  // ========================================
  useEffect(() => {
    if (!isConnecte || !utilisateur?.id) {
      return;
    }

    setupPushNotifications(utilisateur.id);
  }, [isConnecte, utilisateur?.id]);

  /**
   * Configurer les notifications push pour un utilisateur
   */
  const setupPushNotifications = async (userId: number) => {
    try {
      console.log('📱 Configuration notifications push pour user:', userId);

      const pushToken = await registerForPushNotifications();
      if (!pushToken) {
        console.log('⚠️ Aucun push token obtenu');
        return;
      }

      await savePushToken(userId, pushToken);
      console.log('✅ Push token enregistré pour user', userId);
    } catch (error) {
      console.error('❌ Erreur configuration push:', error);
    }
  };

  /**
   * Gérer le clic sur une notification
   */
  const handleNotificationClick = (data: any) => {
    console.log('🔗 Navigation depuis notification:', data);

    if (!data?.type) {
      router.push('/(client)/notification');
      return;
    }

    switch (data.type) {
      case 'paiement_confirme':
        if (data.reservationId) {
          router.push(`/(client)/reservations/detailReservation?id=${data.reservationId}`);
        } else {
          router.push('/(client)/reservations');
        }
        break;

      case 'voyage_reminder':
        if (data.reservationId) {
          router.push(`/(client)/reservations/detailReservation?id=${data.reservationId}`);
        } else if (data.voyageId) {
          router.push(`/(client)/voyages/detailVoyage?id=${data.voyageId}`);
        } else {
          router.push('/(client)/reservations');
        }
        break;

      case 'reservation_annulee':
        router.push('/(client)/reservations');
        break;

      default:
        router.push('/(client)/notification');
        break;
    }
  };

  // ========================================
  // 🎨 STYLES DYNAMIQUES
  // ========================================
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
        },
        tabBarLabel: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -4,
        },
      }),
    [theme]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* 🏠 Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🏢 Agences */}
      <Tabs.Screen
        name="voyages"
        options={{
          title: 'Agences',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🎫 Réservations */}
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'ticket' : 'ticket-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* ⏱️ Historique */}
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 👤 Profil */}
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🚫 PAGES MASQUÉES */}
      <Tabs.Screen name="notification" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />

      {/* Sous-dossiers masqués */}
      <Tabs.Screen name="voyages/detailCooperative" options={{ href: null }} />
      <Tabs.Screen name="voyages/detailVoyage" options={{ href: null }} />
      <Tabs.Screen name="voyages/listeCooperative" options={{ href: null }} />
      <Tabs.Screen name="voyages/paiement" options={{ href: null }} />
      <Tabs.Screen name="voyages/reservation" options={{ href: null }} />
      <Tabs.Screen name="voyages/voyagePropose" options={{ href: null }} />

      <Tabs.Screen name="reservations/detailReservation" options={{ href: null }} />
      <Tabs.Screen name="reservations/listeReservation" options={{ href: null }} />

      <Tabs.Screen name="historique/avis" options={{ href: null }} />
      <Tabs.Screen name="historique/detailVoyage" options={{ href: null }} />
      <Tabs.Screen name="historique/listeVoyage" options={{ href: null }} />

      <Tabs.Screen name="profil/modifierProfile" options={{ href: null }} />
      <Tabs.Screen name="profil/profile" options={{ href: null }} />
      <Tabs.Screen name="profil/theme-selector" options={{ href: null }} />
    </Tabs>
  );
}