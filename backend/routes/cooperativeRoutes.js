// routes/cooperativeRoutes.js
import express from "express";
import {
  getAllCooperatives,
  getCooperativeById,
  getMoyenneAvis // ✅ Import ajouté
} from "../controllers/cooperativeController.js";

const router = express.Router();

/**
 * @route   GET /api/cooperatives
 * @desc    Lister toutes les coopératives
 * @access  Public
 */
router.get("/", getAllCooperatives);

/**
 * @route   GET /api/cooperatives/:id
 * @desc    Détails d'une coopérative (stations, voitures, responsables, prochains voyages)
 * @access  Public
 */
router.get("/:id", getCooperativeById);

/**
 * ✨ NOUVELLE ROUTE
 * @route   GET /api/cooperatives/:id/moyenne
 * @desc    Récupérer la note moyenne et le nombre d'avis de la coopérative
 * @access  Public
 */
router.get("/:id/moyenne", getMoyenneAvis);

export default router;