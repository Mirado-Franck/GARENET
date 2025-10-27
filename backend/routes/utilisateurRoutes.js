// routes/utilisateurRoutes.js
import express from "express";
import {
  createUtilisateur,
  getUtilisateur,
  getAllUtilisateurs,
  updateUtilisateur,
  deleteUtilisateur
} from "../controllers/utilisateurController.js";

const router = express.Router();

// CREATE
router.post("/register", createUtilisateur);

// READ
router.get("/", getAllUtilisateurs);        // GET /api/utilisateurs
router.get("/:id", getUtilisateur);         // GET /api/utilisateurs/1

// UPDATE
router.put("/:id", updateUtilisateur);      // PUT /api/utilisateurs/1

// DELETE
router.delete("/:id", deleteUtilisateur);   // DELETE /api/utilisateurs/1

export default router;