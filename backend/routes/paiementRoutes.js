import express from "express";
import { 
  processCompletePayment, 
  createPaiement, 
  getPaiements 
} from "../controllers/paiementController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/paiements/process-complete
 * @desc    Traiter le paiement d'une réservation existante
 * @access  Private
 * @body    {
 *   reservation_id: number,  // ✅ ID de la réservation
 *   numero_mvola: string,
 *   montant: number
 * }
 */
router.post("/process-complete", authMiddleware, processCompletePayment);

/**
 * @route   POST /api/paiements
 * @desc    Créer un paiement simple
 * @access  Private
 */
router.post("/", authMiddleware, createPaiement);

/**
 * @route   GET /api/paiements
 * @desc    Récupérer les paiements du client
 * @access  Private
 */
router.get("/", authMiddleware, getPaiements);

export default router;