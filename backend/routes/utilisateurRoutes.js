// routes/utilisateurRoutes.js
import express from "express";
import {
  createUtilisateur,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur
} from "../controllers/utilisateurController.js";

const router = express.Router();

/**
 * @route   POST /api/utilisateurs/register
 * @desc    Inscription d'un client
 * @access  Public
 * @body    { nom, prenoms?, email, mot_de_passe, telephone }
 */
router.post("/register", createUtilisateur);

/**
 * @route   GET /api/utilisateurs/:id
 * @desc    Récupérer un utilisateur par ID
 * @access  Public
 */
router.get("/:id", getUtilisateur);

/**
 * @route   PUT /api/utilisateurs/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Public (à sécuriser plus tard)
 * @body    { nom, prenoms, telephone, photo_identite, ... }
 */
router.put("/:id", updateUtilisateur);

/**
 * @route   DELETE /api/utilisateurs/:id
 * @desc    Supprimer un utilisateur (soft delete)
 * @access  Public (à sécuriser)
 */
router.delete("/:id", deleteUtilisateur);

export default router;