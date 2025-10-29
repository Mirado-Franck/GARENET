import express from "express";
import {
  createReservation,
  getReservations,
  cancelReservation,
  getReservationsByClient
} from "../controllers/reservationController.js";

const router = express.Router();

/**
 * @route   POST /api/reservations
 * @desc    Créer une nouvelle réservation avec sélection de places
 * @access  Public (à sécuriser plus tard avec auth)
 * @body    {
 *   code_trajet_id: number,
 *   code_voyage_id: number,
 *   code_client_id: number,
 *   nombre_places: number,
 *   places: string[],           // ex: ["A1", "B3", "C2"]
 *   mode_paiement: string
 * }
 */
router.post("/", createReservation);

/**
 * @route   GET /api/reservations
 * @desc    Récupérer toutes les réservations du client connecté
 * @access  Public (à sécuriser avec req.user.id)
 */
router.get("/", getReservations);

/**
 * @route   PUT /api/reservations/:id/cancel
 * @desc    Annuler une réservation (libère les places)
 * @access  Public (à sécuriser)
 */
router.put("/:id/cancel", cancelReservation);

/**
 * @route   GET /api/reservations/client/:utilisateurId
 * @desc    Récupérer les réservations par ID utilisateur (client)
 * @access  Public (à utiliser en admin ou avec auth)
 */
router.get("/client/:utilisateurId", getReservationsByClient);

export default router;