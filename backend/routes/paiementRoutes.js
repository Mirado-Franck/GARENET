import express from "express";
import { createPaiement, getPaiements } from "../controllers/paiementController.js";

const router = express.Router();

router.post("/", createPaiement); // authMiddleware supprimé
router.get("/", getPaiements); // authMiddleware supprimé

export default router;