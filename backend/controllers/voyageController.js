// controllers/voyageController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === 1. LISTE TOUS LES VOYAGES ===
const getVoyages = async (req, res, next) => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: {
        trajet: true,
        voiture: true,
        chauffeur: true,
        cooperative: true
      },
      orderBy: { date_depart: "desc" }
    });
    res.json(voyages);
  } catch (err) {
    console.error("Erreur getVoyages:", err);
    next(err);
  }
};

// === 2. VOYAGES PAR COOPÉRATIVE ===
const getVoyagesByCooperative = async (req, res, next) => {
  try {
    const { cooperativeId } = req.params;
    const voyages = await prisma.voyage.findMany({
      where: { code_cooperative_id: parseInt(cooperativeId) },
      include: {
        trajet: true,
        voiture: true,
        chauffeur: true
      },
      orderBy: { date_depart: "asc" }
    });
    res.json(voyages);
  } catch (error) {
    console.error("Erreur getVoyagesByCooperative:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 3. PLACES D'UN VOYAGE (SÉLECTIONNABLES) ===
const getPlacesByVoyage = async (req, res, next) => {
  try {
    const { voyageId } = req.params;

    const voyage = await prisma.voyage.findUnique({
      where: { id: parseInt(voyageId) },
      include: {
        voiture: {
          include: {
            places: {
              orderBy: { numero: "asc" }
            }
          }
        }
      }
    });

    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    const places = voyage.voiture.places.map(place => ({
      numero: place.numero,
      est_reserve: place.est_reserve,
      est_chauffeur: place.est_chauffeur,
      selectionnable: !place.est_reserve && !place.est_chauffeur
    }));

    res.json({
      voyageId: voyage.id,
      code_voyage: voyage.code_voyage,
      voiture: voyage.voiture.immatriculation,
      capacite: voyage.voiture.capacite,
      places
    });
  } catch (error) {
    console.error("Erreur getPlacesByVoyage:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 4. RECHERCHE DE VOYAGES (NOUVEAU) ===
const searchVoyages = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Paramètre 'query' requis" });
    }

    const searchTerm = query.toLowerCase();

    const voyages = await prisma.voyage.findMany({
      where: {
        OR: [
          {
            trajet: {
              station_depart: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            trajet: {
              station_arrivee: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        trajet: true,
        voiture: true,
        chauffeur: true,
        cooperative: true
      },
      orderBy: { date_depart: "asc" }
    });

    res.json(voyages);
  } catch (error) {
    console.error("Erreur searchVoyages:", error);
    res.status(500).json({ error: error.message });
  }
};

// === 4. DÉTAIL D'UN VOYAGE PAR ID ===
const getVoyageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const voyage = await prisma.voyage.findUnique({
      where: { id: parseInt(id) },
      include: {
        trajet: true,
        voiture: {
          include: {
            places: {
              orderBy: { numero: "asc" }
            }
          }
        },
        chauffeur: true,
        cooperative: true,
        avis: {
          include: {
            client: {
              include: {
                utilisateur: {
                  select: {
                    nom: true,
                    prenoms: true
                  }
                }
              }
            }
          },
          orderBy: { date_avis: "desc" }
        }
      }
    });

    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    // Calculer le nombre de places disponibles
    const placesReservees = voyage.voiture.places.filter(p => p.est_reserve).length;
    const placesDisponibles = voyage.voiture.capacite - placesReservees - 1; // -1 pour le chauffeur

    res.json({
      ...voyage,
      placesDisponibles
    });
  } catch (error) {
    console.error("Erreur getVoyageById:", error);
    res.status(500).json({ error: error.message });
  }
};

const filterVoyagesByCooperative = async (req, res, next) => {
  try {
    const { cooperativeId } = req.params;
    const { date, status } = req.query;

    console.log('🔍 Filtrage voyages:', { cooperativeId, date, status });

    // Construction des filtres
    const where = {
      code_cooperative_id: parseInt(cooperativeId),
    };

    // Filtre par status (défaut: disponible)
    if (status && status !== 'tous') {
      where.status = status;
    }

    // Filtre par date (si fournie)
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      where.date_depart = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const voyages = await prisma.voyage.findMany({
      where,
      include: {
        trajet: true,
        voiture: true,
        chauffeur: true,
        cooperative: true,
      },
      orderBy: { date_depart: 'asc' },
    });

    console.log(`✅ ${voyages.length} voyage(s) trouvé(s)`);

    res.json(voyages);
  } catch (error) {
    console.error('❌ Erreur filterVoyagesByCooperative:', error);
    res.status(500).json({ error: error.message });
  }
};
  
export {
  getVoyages,
  getVoyagesByCooperative,
  getPlacesByVoyage,
  searchVoyages,
  filterVoyagesByCooperative,
  getVoyageById
};