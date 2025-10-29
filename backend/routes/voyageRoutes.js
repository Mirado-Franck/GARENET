// routes/voyageRoutes.js
import express from "express";
import {
  getVoyages,
  createVoyage,
  getVoyagesByCooperative
} from "../controllers/voyageController.js";

const router = express.Router();

/**
 * @route   GET /api/voyages
 * @desc    Récupérer tous les voyages (avec trajets, voiture, places, chauffeur)
 * @access  Public (à sécuriser avec auth + rôle)
 */
router.get("/", getVoyages);

/**
 * @route   POST /api/voyages
 * @desc    Créer un nouveau voyage + générer automatiquement les places de la voiture
 * @access  Private (admin ou responsable_cooperative)
 * @body    {
 *   code_trajet_id: number,
 *   code_cooperative_id: number,
 *   code_voiture_id: number,
 *   code_chauffeur_id: number,
 *   date_depart: string (YYYY-MM-DD),
 *   heure_depart: string (HH:mm),
 *   prix: number
 * }
 * @returns { voyage, places_generées }
 */
router.post("/", createVoyage);

/**
 * @route   GET /api/voyages/cooperative/:cooperativeId
 * @desc    Récupérer tous les voyages d'une coopérative
 * @access  Public (à sécuriser)
 * @param   cooperativeId - ID de la coopérative
 */
router.get("/cooperative/:cooperativeId", getVoyagesByCooperative);

export default router;