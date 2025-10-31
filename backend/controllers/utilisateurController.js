// controllers/utilisateurController.js
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

// === CRÉER UN CLIENT (SÉCURISÉ + HACHAGE) ===
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

    // === CRÉER L'UTILISATEUR ===
    const utilisateur = await prisma.utilisateur.create({
      data: {
        ref_utilisateur,
        nom,
        prenoms: prenoms || null,
        email,
        telephone: telephone.toString(),
        mot_de_passe: mot_de_passe_hache, // HACHÉ
        role: "client",                   // PAR DÉFAUT
        type_utilisateur: "standard",     // ou "client" si tu veux
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
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error("Erreur création client:", error);
    res.status(500).json({ error: error.message });
  }
};

// === CONNEXION (LOGIN) ===
const loginUtilisateur = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Rechercher l'utilisateur par email
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        client: true // Inclure les infos client si c'est un client
      }
    });

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est actif
    if (utilisateur.statut_compte !== 'actif') {
      return res.status(403).json({ error: "Compte désactivé" });
    }

    // Vérifier si le compte est supprimé (soft delete)
    if (utilisateur.deleted_at !== null) {
      return res.status(403).json({ error: "Ce compte n'existe plus" });
    }

    // ✅ Vérifier le mot de passe (avec bcrypt)

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // ✅ Mettre à jour la date de dernier accès
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { dernier_acces: new Date() }
    });

    // ✅ Retourner les infos utilisateur (sans le mot de passe)
    const { mot_de_passe: _, ...utilisateurSansMotDePasse } = utilisateur;

    res.status(200).json({
      message: "Connexion réussie",
      utilisateur: utilisateurSansMotDePasse,
      // token: 'votre-jwt-token' // On ajoutera JWT plus tard si nécessaire
    });

  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ 
      error: "Erreur lors de la connexion", 
      details: error.message 
    });
  }
};

// === GET, UPDATE, DELETE (inchangés) ===
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
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    delete data.mot_de_passe;
    delete data.role;
    if (data.telephone) data.telephone = data.telephone.toString();

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data,
      include: { client: true }
    });
    res.json({ message: "Mis à jour", utilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    res.json({ message: "Supprimé (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createUtilisateur,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur, 
  loginUtilisateur
};