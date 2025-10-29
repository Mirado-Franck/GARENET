import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === RÉCUPÉRER TOUS LES VOYAGES ACTIFS ===
const getVoyages = async (req, res, next) => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: {
        trajet: true,
        voiture: {
          include: {
            places: true
          }
        },
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

// === CRÉER UN VOYAGE + GÉNÉRER LES PLACES ===
const createVoyage = async (req, res, next) => {
  try {
    const {
      code_trajet_id,
      code_cooperative_id,
      code_voiture_id,
      code_chauffeur_id,
      date_depart,
      heure_depart,
      prix
    } = req.body;

    // === VALIDATION ===
    if (!code_trajet_id || !code_cooperative_id || !code_voiture_id || !code_chauffeur_id || !date_depart || !prix) {
      return res.status(400).json({ error: "Tous les champs obligatoires sont requis" });
    }

    // === VÉRIFIER LES RÉFÉRENCES ===
    const [trajet, voiture, chauffeur, cooperative] = await Promise.all([
      prisma.trajet.findUnique({ where: { id: code_trajet_id } }),
      prisma.voiture.findUnique({ where: { id: code_voiture_id } }),
      prisma.chauffeur.findUnique({ where: { id: code_chauffeur_id } }),
      prisma.cooperative.findUnique({ where: { id: code_cooperative_id } })
    ]);

    if (!trajet || !voiture || !chauffeur || !cooperative) {
      return res.status(404).json({ error: "Référence invalide (trajet, voiture, chauffeur ou coopérative)" });
    }

    // === VÉRIFIER DISPONIBILITÉ VOITURE ===
    if (voiture.disponibilite !== "disponible") {
      return res.status(409).json({ error: "Voiture non disponible" });
    }

    // === GÉNÉRER code_voyage ===
    const code_voyage = `VOY${Date.now()}${Math.floor(Math.random() * 100)}`;

    // === CRÉER LE VOYAGE ===
    const voyage = await prisma.voyage.create({
      data: {
        code_trajet_id,
        code_cooperative_id,
        code_voiture_id,
        code_chauffeur_id,
        code_voyage,
        date_depart: new Date(date_depart),
        heure_depart: heure_depart ? new Date(`1970-01-01T${heure_depart}:00`) : null,
        prix: parseFloat(prix),
        status: "planifie"
      },
      include: {
        trajet: true,
        voiture: true,
        chauffeur: true,
        cooperative: true
      }
    });

    // === GÉNÉRER LES PLACES DE LA VOITURE ===
    const { capacite, nb_ranger, nb_place_par_ranger } = voiture;
    const placesToCreate = [];

    // Siège chauffeur
    placesToCreate.push({
      voiture_id: code_voiture_id,
      numero: "0",
      est_chauffeur: true,
      est_reserve: true // Réservé au chauffeur
    });

    let placeCounter = 1;
    for (let r = 1; r <= nb_ranger; r++) {
      for (let p = 1; p <= nb_place_par_ranger; p++) {
        if (placeCounter > capacite - 1) break; // -1 pour le chauffeur
        const lettre = String.fromCharCode(64 + r); // A, B, C...
        placesToCreate.push({
          voiture_id: code_voiture_id,
          numero: `${lettre}${p}`,
          est_chauffeur: false,
          est_reserve: false
        });
        placeCounter++;
      }
      if (placeCounter > capacite - 1) break;
    }

    await prisma.place_voiture.createMany({
      data: placesToCreate,
      skipDuplicates: true
    });

    // === METTRE À JOUR DISPONIBILITÉ VOITURE ===
    await prisma.voiture.update({
      where: { id: code_voiture_id },
      data: { disponibilite: "en_service" }
    });

    res.status(201).json({
      message: "Voyage créé avec succès",
      voyage,
      places_generées: placesToCreate.length
    });
  } catch (err) {
    console.error("Erreur createVoyage:", err);
    next(err);
  }
};

// === RÉCUPÉRER LES VOYAGES PAR COOPÉRATIVE ===
const getVoyagesByCooperative = async (req, res, next) => {
  try {
    const { cooperativeId } = req.params;

    const voyages = await prisma.voyage.findMany({
      where: { code_cooperative_id: parseInt(cooperativeId) },
      include: {
        trajet: true,
        voiture: { include: { places: true } },
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

export {
  getVoyages,
  createVoyage,
  getVoyagesByCooperative
};