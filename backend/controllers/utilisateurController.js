// controllers/utilisateurController.js
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import { generateToken } from '../utils/jwtUtils.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// === CRÉER UN CLIENT (AVEC PHOTO OPTIONNELLE) ===
const createUtilisateur = async (req, res) => {
  try {
    const {
      nom,
      prenoms,
      email,
      mot_de_passe,
      telephone
    } = req.body;

    // === VALIDATION ===
    if (!nom || !email || !mot_de_passe || !telephone) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // === VÉRIFIER SI EMAIL EXISTE DÉJÀ ===
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // === HACHAGE DU MOT DE PASSE ===
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hache = await bcrypt.hash(mot_de_passe, salt);

    // === GÉNÉRER RÉFÉRENCES ===
    const ref_utilisateur = `USER${Date.now()}${Math.floor(Math.random() * 100)}`;

    // ✅ Récupérer le chemin de la photo si uploadée
    const photo_identite = req.file ? `/uploads/photos/${req.file.filename}` : null;

    // === CRÉER L'UTILISATEUR ===
    const utilisateur = await prisma.utilisateur.create({
      data: {
        ref_utilisateur,
        nom,
        prenoms: prenoms || null,
        email,
        telephone: telephone.toString(),
        mot_de_passe: mot_de_passe_hache,
        photo_identite, // ✅ Ajout photo
        role: "client",
        type_utilisateur: "standard",
        statut_compte: "actif",
        date_creation_compte: new Date()
      }
    });

    // === CRÉER LE CLIENT (même ID) ===
    const ref_client = `CLI${Date.now()}`;
    await prisma.client.create({
      data: {
        id: utilisateur.id,
        ref_client,
        adresse: null,
        ref_responsable_id: null
      }
    });

    // === RÉPONSE (SANS MOT DE PASSE) ===
    res.status(201).json({
      message: "Client créé avec succès",
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenoms: utilisateur.prenoms,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        photo_identite: utilisateur.photo_identite, // ✅ Inclure la photo
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error("Erreur création client:", error);
    res.status(500).json({ error: error.message });
  }
};

// === CONNEXION (LOGIN) - INCHANGÉ ===
const loginUtilisateur = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        client: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    if (utilisateur.statut_compte !== 'actif') {
      return res.status(403).json({ error: "Compte désactivé" });
    }

    if (utilisateur.deleted_at !== null) {
      return res.status(403).json({ error: "Ce compte n'existe plus" });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { dernier_acces: new Date() }
    });

    const payload = {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      type_utilisateur: utilisateur.type_utilisateur
    };

    const token = generateToken(payload);

    const { mot_de_passe: _, ...utilisateurSansMotDePasse } = utilisateur;

    res.status(200).json({
      message: "Connexion réussie",
      utilisateur: utilisateurSansMotDePasse,
      token: token
    });

  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ 
      error: "Erreur lors de la connexion", 
      details: error.message 
    });
  }
};

// === GET UTILISATEUR ===
const getUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      include: { client: true }
    });
    if (!utilisateur || utilisateur.deleted_at) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    
    // ✅ Ne pas retourner le mot de passe
    const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
    res.json(utilisateurSansMotDePasse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ✨ NOUVELLE FONCTION : UPDATE UTILISATEUR AVEC PHOTO ===
const updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    // Empêcher la modification de certains champs sensibles
    delete data.mot_de_passe;
    delete data.role;
    delete data.deleted_at;
    delete data.date_creation_compte;
    
    if (data.telephone) data.telephone = data.telephone.toString();

    // ✅ Si nouvelle photo uploadée
    if (req.file) {
      // Récupérer l'ancien utilisateur pour supprimer l'ancienne photo
      const oldUser = await prisma.utilisateur.findUnique({
        where: { id: parseInt(id) }
      });

      // Supprimer l'ancienne photo si elle existe
      if (oldUser?.photo_identite) {
        const oldPhotoPath = path.join(__dirname, '..', oldUser.photo_identite);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      data.photo_identite = `/uploads/photos/${req.file.filename}`;
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data,
      include: { client: true }
    });

    const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
    res.json({ message: "Profil mis à jour avec succès", utilisateur: utilisateurSansMotDePasse });
  } catch (error) {
    console.error("Erreur update:", error);
    res.status(500).json({ error: error.message });
  }
};

// === ✨ NOUVELLE FONCTION : CHANGER LE MOT DE PASSE ===
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
    }

    if (nouveau_mot_de_passe.length < 6) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
    }

    // Récupérer l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) }
    });

    if (!utilisateur) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier l'ancien mot de passe
    const motDePasseValide = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const nouveau_mot_de_passe_hache = await bcrypt.hash(nouveau_mot_de_passe, salt);

    // Mettre à jour
    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { mot_de_passe: nouveau_mot_de_passe_hache }
    });

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    res.status(500).json({ error: error.message });
  }
};

// === DELETE (SOFT) ===
const deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    res.json({ message: "Compte supprimé (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === ✨ NOUVELLE FONCTION : SAUVEGARDER LE PUSH TOKEN ===
const updatePushToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { push_token } = req.body;

    if (!push_token) {
      return res.status(400).json({ error: "Push token requis" });
    }

    console.log(`📱 Sauvegarde push token pour utilisateur ${id}`);

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { push_token }
    });

    console.log('✅ Push token sauvegardé avec succès');

    res.json({ 
      message: "Push token enregistré avec succès",
      push_token: utilisateur.push_token 
    });
  } catch (error) {
    console.error("❌ Erreur sauvegarde push token:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createUtilisateur,
  updatePushToken,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur, 
  loginUtilisateur,
  changePassword
};