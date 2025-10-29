// routes/paiementRoutes.js
import express from "express";
import { createPaiement, getPaiements } from "../controllers/paiementController.js";

const router = express.Router();

/**
 * @route   POST /api/paiements
 * @desc    Enregistrer un paiement (complet ou partiel)
 * @access  Private (client ou responsable)
 * @body    {
 *   code_reservation_id: number,
 *   montant: number,
 *   mode_paiement: "mobile_money" | "carte" | "espece",
 *   payement_restant?: number  // Optionnel
 * }
 * @returns { paiement, montant_restant }
 */
router.post("/", createPaiement);

/**
 * @route   GET /api/paiements
 * @desc    Récupérer tous les paiements du client connecté
 * @access  Private
 * @returns Liste des paiements avec détails de réservation
 */
router.get("/", getPaiements);

export default router;