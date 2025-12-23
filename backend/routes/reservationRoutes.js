// backend/routes/reservationRoutes.js
import express from "express";
import {
  createPendingReservation, // ✅ NOUVEAU
  createReservation,
  getReservations,
  cancelReservation,
  getHistoriqueReservations
} from "../controllers/reservationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * 🆕 NOUVELLE ROUTE
 * @route   POST /api/reservations/pending
 * @desc    Créer une réservation "en attente" avant paiement
 * @access  Private
 * @body    { code_voyage_id: number, places: string[] }
 */
router.post("/pending", authMiddleware, createPendingReservation);

/**
 * @route   POST /api/reservations
 * @desc    Créer une nouvelle réservation "confirmée" (ancienne route)
 * @access  Private
 */
router.post("/", authMiddleware, createReservation);

/**
 * @route   GET /api/reservations/historique
 * @desc    Récupérer l'historique des réservations terminées
 * @access  Private
 */
router.get("/historique", authMiddleware, getHistoriqueReservations);

/**
 * @route   PUT /api/reservations/:id/cancel
 * @desc    Annuler une réservation (libère les places)
 * @access  Private
 */
router.put("/:id/cancel", authMiddleware, cancelReservation);

/**
 * @route   GET /api/reservations
 * @desc    Récupérer toutes les réservations du client connecté
 * @access  Private
 */
router.get("/", authMiddleware, getReservations);

export default router;