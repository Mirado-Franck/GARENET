import express from "express";
import {
  createReservation,
  getReservations,
  cancelReservation,
  getHistoriqueReservations
} from "../controllers/reservationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";  // ✅ Import du middleware

const router = express.Router();

/**
 * @route   POST /api/reservations
 * @desc    Créer une nouvelle réservation avec sélection de places
 * @access  Private (authentification requise)
 * @body    {
 *   code_trajet_id: number,
 *   code_voyage_id: number,
 *   nombre_places: number,
 *   places: string[],           // ex: ["A1", "B3", "C2"]
 *   mode_paiement: string
 * }
 * Note: code_client_id sera récupéré depuis req.user.id (via JWT)
 */
router.post("/", authMiddleware, createReservation);  // ✅ Protégé

/**
 * @route   GET /api/reservations/historique
 * @desc    Récupérer l'historique des réservations terminées du client connecté
 * @access  Private (authentification requise)
 */

router.get("/historique", authMiddleware, getHistoriqueReservations);  // ✅ AJOUTE cette ligne
/**
 * @route   PUT /api/reservations/:id/cancel
 * @desc    Annuler une réservation (libère les places)
 * @access  Private (authentification requise)
 */
router.put("/:id/cancel", authMiddleware, cancelReservation);  // ✅ Protégé

/**
 * @route   GET /api/reservations
 * @desc    Récupérer toutes les réservations du client connecté
 * @access  Private (authentification requise)
 */
router.get("/", authMiddleware, getReservations);  // ✅ Protégé



export default router;