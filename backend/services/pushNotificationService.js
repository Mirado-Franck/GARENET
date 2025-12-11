// backend/services/pushNotificationService.js
import { Expo } from 'expo-server-sdk';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const expo = new Expo();

/**
 * Envoyer une notification push à un utilisateur
 */
export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    console.log(`📱 Envoi notification push à l'utilisateur ${userId}`);

    // Récupérer le push token de l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { push_token: true, nom: true }
    });

    if (!user?.push_token) {
      console.log(`⚠️ Aucun push token pour l'utilisateur ${userId} (${user?.nom || 'inconnu'})`);
      return { success: false, reason: 'no_token' };
    }

    const pushToken = user.push_token;

    // Vérifier que le token est valide
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`❌ Token Expo invalide: ${pushToken}`);
      return { success: false, reason: 'invalid_token' };
    }

    // Créer le message
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default', // Pour Android
    };

    console.log('📨 Message préparé:', { title, body, to: pushToken.substring(0, 20) + '...' });

    // Envoyer la notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('✅ Notification envoyée, ticket:', ticketChunk);
      } catch (error) {
        console.error('❌ Erreur envoi chunk notification:', error);
      }
    }

    return { success: true, tickets };
  } catch (error) {
    console.error('❌ Erreur sendPushNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un rappel de voyage (notifications + push) pour toutes les réservations confirmées d'un voyage
 */
export const sendVoyageReminder = async (voyageId) => {
  try {
    console.log(`⏰ Envoi rappels voyage ${voyageId}`);

    // Récupérer le voyage et toutes les réservations confirmées
    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: {
        trajet: true,
        cooperative: true,
        reservation: {
          where: {
            statut: { in: ['confirmee', 'confirmée'] }
          },
          include: {
            client: {
              include: {
                utilisateur: true
              }
            },
            places: {
              include: {
                place: true
              }
            }
          }
        }
      }
    });

    if (!voyage) {
      console.log(`⚠️ Voyage ${voyageId} non trouvé`);
      return { success: false, reason: 'voyage_not_found' };
    }

    if (!voyage.reservation || voyage.reservation.length === 0) {
      console.log(`⚠️ Aucune réservation confirmée pour le voyage ${voyageId}`);
      return { success: false, reason: 'no_confirmed_reservations' };
    }

    console.log(`📋 ${voyage.reservation.length} réservation(s) confirmée(s) trouvée(s)`);

    const results = [];

    for (const reservation of voyage.reservation) {
      const userId = reservation.client.utilisateur.id;
      const placesNumeros = reservation.places.map(p => p.place.numero).join(', ');

      const depart = voyage.trajet.station_depart;
      const arrivee = voyage.trajet.station_arrivee;
      const dateStr = new Date(voyage.date_depart).toLocaleString('fr-FR');

      const title = '🚌 Rappel de voyage';
      // Pour les tests on peut laisser "dans quelques instants"
      const body = `Votre voyage ${depart} → ${arrivee} part bientôt (${dateStr}). Places: ${placesNumeros}`;

      const data = {
        type: 'voyage_reminder',
        voyageId: voyage.id,
        reservationId: reservation.id,
        code_voyage: voyage.code_voyage,
        code_reservation: reservation.code_reservation,
      };

      // Envoyer push notification
      const pushResult = await sendPushNotification(userId, title, body, data);

      // Créer aussi une notification in-app
      await prisma.notification.create({
        data: {
          ref_notification: `NOTIF-RAPPEL-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          ref_utilisateur_id: userId,
          type: 'voyage_reminder',
          contenu: body,
          date_envoi: new Date(),
          statut: 'non_lu',
          canal: 'app',
        },
      });

      results.push({ userId, success: pushResult.success });
    }

    console.log(`✅ Rappels envoyés: ${results.filter(r => r.success).length}/${results.length}`);
    return { success: true, results };
  } catch (error) {
    console.error('❌ Erreur sendVoyageReminder:', error);
    return { success: false, error: error.message };
  }
};