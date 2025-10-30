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

export {
  getAllCooperatives,
  getCooperativeById
};