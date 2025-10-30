// routes/voyageRoutes.js
import express from "express";
import { getVoyages,
  getVoyagesByCooperative,
  getPlacesByVoyage
} from "../controllers/voyageController.js";

const router = express.Router();

/**
 * @route   GET /api/voyages
 * @desc    Liste tous les voyages
 */
router.get("/", getVoyages);

/**
 * @route   GET /api/voyages/cooperative/:cooperativeId
 * @desc    Voyages d'une coopérative
 */
router.get("/cooperative/:cooperativeId", getVoyagesByCooperative);

/**
 * @route   GET /api/voyages/:voyageId/places
 * @desc    Places sélectionnables d'un voyage
 * @returns { places: [{ numero: "A1", selectionnable: true }] }
 */
router.get("/:voyageId/places", getPlacesByVoyage);

export default router;