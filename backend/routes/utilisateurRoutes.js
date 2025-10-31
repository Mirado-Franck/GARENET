// routes/utilisateurRoutes.js
import express from "express";
import {
  createUtilisateur,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  loginUtilisateur
} from "../controllers/utilisateurController.js";

const router = express.Router();


router.post("/register", createUtilisateur);
router.post('/login', loginUtilisateur);

router.get("/:id", getUtilisateur);

router.put("/:id", updateUtilisateur);

router.delete("/:id", deleteUtilisateur);

export default router;