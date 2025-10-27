import express from "express";
import { getVoyages, createVoyage } from "../controllers/voyageController.js";

const router = express.Router();

router.get("/", getVoyages); // authMiddleware supprimé
router.post("/", createVoyage); // authMiddleware supprimé

export default router;