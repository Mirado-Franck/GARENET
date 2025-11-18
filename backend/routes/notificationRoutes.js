// routes/notificationRoutes.js
import express from 'express';
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Récupérer toutes les notifications de l'utilisateur connecté
 * @access  Private
 */
router.get('/', authMiddleware, getNotificationsByUser);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Compter les notifications non lues
 * @access  Private
 */
router.get('/unread-count', authMiddleware, getUnreadCount);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
router.put('/read-all', authMiddleware, markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.put('/:id/read', authMiddleware, markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Supprimer une notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, deleteNotification);

/**
 * @route   POST /api/notifications
 * @desc    Créer une notification (usage interne système)
 * @access  Private
 */
router.post('/', authMiddleware, createNotification);

export default router;