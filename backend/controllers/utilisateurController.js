// controllers/utilisateurController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === CRÉER UN CLIENT ===
const createUtilisateur = async (req, res) => {
  try {
    const {
      nom,
      prenoms,
      email,
      mot_de_passe,
      telephone
    } = req.body;

    // Validation
    if (!nom || !email || !mot_de_passe || !telephone) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const ref_utilisateur = `USER${Date.now()}${Math.floor(Math.random() * 100)}`;

    // ÉTAPE 1 : CRÉER L'UTILISATEUR (SANS ID)
    const utilisateur = await prisma.utilisateur.create({
      data: {
        ref_utilisateur,
        nom,
        prenoms: prenoms || null,
        email,
        telephone: telephone.toString(),
        mot_de_passe,
        role: "client",
        type_utilisateur: "standard",
        statut_compte: "actif",
        date_creation_compte: new Date(),
        photo_identite: null,
        deleted_at: null
      }
    });

    // ÉTAPE 2 : CRÉER LE CLIENT AVEC LE MÊME ID
    const ref_client = `CLI${Date.now()}`;
    await prisma.client.create({
      data: {
        id: utilisateur.id,  // Prisma accepte ici
        ref_client,
        adresse: null,
        ref_responsable_id: null,
        deleted_at: null
      }
    });

    res.status(201).json({
      message: "Client créé avec succès",
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error("Erreur création client:", error);
    res.status(500).json({ 
      error: "Échec création", 
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
  deleteUtilisateur
};