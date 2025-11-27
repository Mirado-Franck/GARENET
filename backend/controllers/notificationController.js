// controllers/notificationController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === 1. RÉCUPÉRER LES NOTIFICATIONS D'UN UTILISATEUR ===
const getNotificationsByUser = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Depuis le JWT
    
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        ref_utilisateur_id: parseInt(userId)
      },
      orderBy: {
        date_envoi: 'desc'
      }
    });

    res.json(notifications);
  } catch (error) {
    console.error("Erreur getNotificationsByUser:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 2. COMPTER LES NOTIFICATIONS NON LUES ===
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const count = await prisma.notification.count({
      where: {
        ref_utilisateur_id: parseInt(userId),
        statut: 'non_lu'
      }
    });

    res.json({ count });
  } catch (error) {
    console.error("Erreur getUnreadCount:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 3. MARQUER UNE NOTIFICATION COMME LUE ===
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    if (notification.ref_utilisateur_id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Marquer comme lue
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { statut: 'lu' }
    });

    res.json({ 
      success: true, 
      message: "Notification marquée comme lue",
      notification: updated 
    });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 4. MARQUER TOUTES LES NOTIFICATIONS COMME LUES ===
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const result = await prisma.notification.updateMany({
      where: {
        ref_utilisateur_id: parseInt(userId),
        statut: 'non_lu'
      },
      data: {
        statut: 'lu'
      }
    });

    res.json({ 
      success: true, 
      message: `${result.count} notification(s) marquée(s) comme lue(s)`,
      count: result.count
    });
  } catch (error) {
    console.error("Erreur markAllAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 5. SUPPRIMER UNE NOTIFICATION ===
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    if (notification.ref_utilisateur_id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Supprimer
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true, 
      message: "Notification supprimée" 
    });
  } catch (error) {
    console.error("Erreur deleteNotification:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 6. CRÉER UNE NOTIFICATION (SYSTÈME INTERNE) ===
const createNotification = async (req, res, next) => {
  try {
    const { 
      ref_utilisateur_id, 
      type, 
      contenu,
      canal = 'app'
    } = req.body;

    if (!ref_utilisateur_id || !type || !contenu) {
      return res.status(400).json({ 
        error: "ref_utilisateur_id, type et contenu sont requis" 
      });
    }

    // Générer ref unique
    const ref_notification = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const notification = await prisma.notification.create({
      data: {
        ref_notification,
        ref_utilisateur_id: parseInt(ref_utilisateur_id),
        type,
        contenu,
        date_envoi: new Date(),
        statut: 'non_lu',
        canal
      }
    });

    res.status(201).json({
      success: true,
      message: "Notification créée",
      notification
    });
  } catch (error) {
    console.error("Erreur createNotification:", error);
    res.status(500).json({ error: error.message });
  }
};
// Compter les notifications non lues
const countUnread = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        ref_utilisateur_id: userId,
        statut: 'non_lu' // Assure-toi que c'est bien 'non_lu' dans ta BDD
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
export {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification, 
  countUnread
};