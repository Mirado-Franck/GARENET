// controllers/cooperativeController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === 1. LISTER TOUTES LES COOPÉRATIVES ===
const getAllCooperatives = async (req, res, next) => {
  try {
    const cooperatives = await prisma.cooperative.findMany({
      select: {
        id: true,
        code_cooperative: true,
        nom: true,
        adresse: true,
        contact: true,
        statut: true,
        logo: true,
        date_inscription: true
      },
      orderBy: { nom: "asc" }
    });

    res.json(cooperatives);
  } catch (error) {
    console.error("Erreur getAllCooperatives:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 2. DÉTAILS D'UNE COOPÉRATIVE PAR ID ===
const getCooperativeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cooperative = await prisma.cooperative.findUnique({
      where: { id: parseInt(id) },
      include: {
        station: {
          select: {
            id: true,
            code_station: true,
            nom: true,
            localisation: true,
            capacite: true
          }
        },
        voiture: {
          select: {
            id: true,
            immatriculation: true,
            modele: true,
            capacite: true,
            disponibilite: true
          }
        },
        responsable_cooperative: {
          select: {
            id: true,
            ref_responsable: true,
            utilisateur: {
              select: {
                nom: true,
                prenoms: true,
                telephone: true
              }
            }
          }
        },
        voyage: {
          where: { status: { in: ["planifie", "en_cours"] } },
          select: {
            id: true,
            code_voyage: true,
            date_depart: true,
            heure_depart: true,
            prix: true,
            status: true
          },
          take: 5,
          orderBy: { date_depart: "desc" }
        }
      }
    });

    if (!cooperative) {
      return res.status(404).json({ error: "Coopérative non trouvée" });
    }

    res.json(cooperative);
  } catch (error) {
    console.error("Erreur getCooperativeById:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 3. ✨ NOUVELLE FONCTION : MOYENNE DES AVIS D'UNE COOPÉRATIVE ===
const getMoyenneAvis = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérifier que la coopérative existe
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, nom: true }
    });

    if (!cooperative) {
      return res.status(404).json({ error: "Coopérative non trouvée" });
    }

    // Récupérer tous les avis des voyages de cette coopérative
    const avis = await prisma.avis.findMany({
      where: {
        voyage: {
          code_cooperative_id: parseInt(id)
        },
        deleted_at: null // Exclure les avis supprimés
      },
      select: {
        note: true
      }
    });

    // Calculer la moyenne
    const nombreAvis = avis.length;
    const moyenne = nombreAvis > 0
      ? avis.reduce((sum, a) => sum + a.note, 0) / nombreAvis
      : 0;

    res.json({
      cooperative_id: parseInt(id),
      cooperative_nom: cooperative.nom,
      nombre_avis: nombreAvis,
      note_moyenne: parseFloat(moyenne.toFixed(2))
    });

  } catch (error) {
    console.error("Erreur getMoyenneAvis:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllCooperatives,
  getCooperativeById,
  getMoyenneAvis // ✅ Export ajouté
};