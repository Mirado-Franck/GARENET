import express from "express";
import { createAvis, getAvisByVoyage } from "../controllers/avisController.js";

const router = express.Router();

router.post("/", createAvis); // authMiddleware supprimé
router.get("/voyage/:voyageId", getAvisByVoyage); // authMiddleware supprimé

export default router;