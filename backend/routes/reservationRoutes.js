import express from "express";
import { createReservation, getReservations, cancelReservation, getReservationsByClient } from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", createReservation); // authMiddleware supprimé
router.get("/", getReservations); // authMiddleware supprimé
router.put("/:id/cancel", cancelReservation); // authMiddleware supprimé
router.get("/client/:utilisateurId", getReservationsByClient);


export default router;