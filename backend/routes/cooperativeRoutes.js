// routes/cooperativeRoutes.js
import express from "express";
import {
  getAllCooperatives,
  getCooperativeById
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

export default router;