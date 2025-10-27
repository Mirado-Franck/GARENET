// controllers/utilisateurController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// CREATE - Inscription
const createUtilisateur = async (req, res) => {
  try {
    const { nom, prenoms, email, motDePasse, telephone, role = "client" } = req.body;

    const utilisateur = await prisma.utilisateur.create({
      data: {
        idUtilisateur: `USER${Date.now()}`,
        nom,
        prenoms: prenoms || "",
        email,
        motDePasse,
        telephone: parseInt(telephone) || 0,
        role,
        statutCompte: "actif",
        dateCreationCompte: new Date(),
        photoIdentiter: ""
      }
    });

    res.status(201).json({ message: "Client créé", utilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ - Récupérer un utilisateur par ID
const getUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) }
    });

    if (!utilisateur) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ - Lister tous les utilisateurs
const getAllUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      orderBy: { dateCreationCompte: "desc" }
    });
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE - Modifier un utilisateur
const updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Convertir telephone si présent
    if (data.telephone) {
      data.telephone = parseInt(data.telephone);
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ message: "Utilisateur mis à jour", utilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Supprimer un utilisateur
const deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.utilisateur.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createUtilisateur,
  getUtilisateur,
  getAllUtilisateurs,
  updateUtilisateur,
  deleteUtilisateur
};