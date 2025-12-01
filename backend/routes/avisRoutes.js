// routes/avisRoutes.js
import express from "express";
import { 
  createAvis, 
  getAvisByVoyage, 
  getLatestAvis,
  getAvisByCooperative  // 👈 AJOUT DE L'IMPORT
} from "../controllers/avisController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// ==========================================
// ROUTES EXISTANTES (NE PAS TOUCHER)
// ==========================================

/**
 * @route   POST /api/avis
 * @desc    Laisser un avis sur un voyage terminé
 * @access  Private (client authentifié)
 * @body    {
 *   code_voyage_id: number,
 *   note: number (0-5),
 *   commentaire?: string
 * }
 * @returns { avis, moyenne_satisfaction }
 */
router.post("/", authMiddleware, createAvis);

/**
 * @route   GET /api/avis/avis
 * @desc    Récupérer les derniers avis (global)
 * @access  Public
 * @query   limit - Nombre d'avis (défaut: 10)
 */
router.get("/avis", getLatestAvis);

/**
 * @route   GET /api/avis/voyage/:voyageId
 * @desc    Récupérer tous les avis d'un voyage (soft delete exclu)
 * @access  Public
 * @param   voyageId - ID du voyage
 * @returns { avis[], count, moyenne }
 */
router.get("/voyage/:voyageId", getAvisByVoyage);

// ==========================================
// 👇 NOUVELLE ROUTE (AJOUT)
// ==========================================

/**
 * @route   GET /api/avis/cooperative/:cooperativeId
 * @desc    Récupérer tous les avis d'une coopérative
 * @access  Public
 * @param   cooperativeId - ID de la coopérative
 * @query   limit - Nombre max d'avis (défaut: 50)
 * @returns { avis[], count, moyenne, distribution }
 */
router.get("/cooperative/:cooperativeId", getAvisByCooperative);

export default router;