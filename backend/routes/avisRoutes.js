// routes/avisRoutes.js
import express from "express";
import { createAvis, getAvisByVoyage, getLatestAvis } from "../controllers/avisController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; 
const router = express.Router();

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
router.get("/avis", getLatestAvis);
/**
 * @route   GET /api/avis/voyage/:voyageId
 * @desc    Récupérer tous les avis d'un voyage (soft delete exclu)
 * @access  Public
 * @param   voyageId - ID du voyage
 * @returns { avis[], count, moyenne }
 */
router.get("/voyage/:voyageId", getAvisByVoyage);

export default router;