// routes/utilisateurRoutes.js
import express from "express";
import {
  createUtilisateur,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  loginUtilisateur,
  changePassword
} from "../controllers/utilisateurController.js";
import { upload } from "../config/multerConfig.js"; // ✅ Import multer
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Inscription avec upload de photo optionnelle
router.post("/register", upload.single('photo'), createUtilisateur);

// Connexion
router.post('/login', loginUtilisateur);

// Récupérer un utilisateur (protégé)
router.get("/:id", authMiddleware, getUtilisateur);

// ✅ Mettre à jour avec photo optionnelle (protégé)
router.put("/:id", authMiddleware, upload.single('photo'), updateUtilisateur);

// ✅ Changer le mot de passe (protégé)
router.put("/:id/password", authMiddleware, changePassword);

// Supprimer (soft delete)
router.delete("/:id", authMiddleware, deleteUtilisateur);

export default router;