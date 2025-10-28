import express from "express";
import { getVoyages, createVoyage, getVoyagesByCooperative } from "../controllers/voyageController.js";

const router = express.Router();

router.get("/", getVoyages); // authMiddleware supprimé
router.post("/", createVoyage); // authMiddleware supprimé
router.get("/cooperative/:cooperativeId", getVoyagesByCooperative);

export default router;