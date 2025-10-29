import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === CRÉER UN AVIS ===
const createAvis = async (req, res, next) => {
  try {
    const {
      code_voyage_id,
      note,
      commentaire
    } = req.body;

    const code_client_id = req.user?.id || req.body.code_client_id; // À adapter avec auth

    // === VALIDATION ===
    if (!code_voyage_id || !code_client_id || note === undefined) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    if (note < 0 || note > 5) {
      return res.status(400).json({ error: "La note doit être entre 0 et 5" });
    }

    // === VÉRIFIER QUE LE VOYAGE EXISTE ET EST TERMINÉ ===
    const voyage = await prisma.voyage.findUnique({
      where: { id: code_voyage_id },
      select: { status: true, date_depart: true }
    });

    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    if (voyage.status !== "termine") {
      return res.status(400).json({ error: "Impossible de noter un voyage non terminé" });
    }

    // === VÉRIFIER QUE LE CLIENT A RÉSERVÉ CE VOYAGE ===
    const reservation = await prisma.reservation.findFirst({
      where: {
        code_voyage_id,
        code_client_id,
        statut: "confirmee"
      }
    });

    if (!reservation) {
      return res.status(403).json({ error: "Vous n'avez pas voyagé avec ce trajet" });
    }

    // === ÉVITER LES DOUBLONS ===
    const existingAvis = await prisma.avis.findFirst({
      where: {
        code_voyage_id,
        code_client_id,
        deleted_at: null
      }
    });

    if (existingAvis) {
      return res.status(409).json({ error: "Vous avez déjà laissé un avis" });
    }

    // === GÉNÉRER ref_avis ===
    const ref_avis = `AVIS${Date.now()}${Math.floor(Math.random() * 100)}`;

    // === CRÉER L'AVIS ===
    const avis = await prisma.avis.create({
      data: {
        code_voyage_id,
        code_client_id,
        ref_avis,
        note: parseFloat(note),
        commentaire: commentaire?.trim() || null,
        date_avis: new Date()
      },
      include: {
        client: { select: { utilisateur: { select: { nom: true, prenoms: true } } } },
        voyage: { select: { code_voyage: true } }
      }
    });

    // === METTRE À JOUR LA MOYENNE DU CLIENT ===
    const stats = await prisma.avis.aggregate({
      where: { code_client_id, deleted_at: null },
      _avg: { note: true },
      _count: { note: true }
    });

    const moyenne = stats._avg.note || 0;

    await prisma.client.update({
      where: { id: code_client_id },
      data: { moyenne_satisfaction: parseFloat(moyenne.toFixed(2)) }
    });

    res.status(201).json({
      message: "Avis enregistré avec succès",
      avis,
      moyenne_satisfaction: moyenne.toFixed(2)
    });
  } catch (err) {
    console.error("Erreur createAvis:", err);
    next(err);
  }
};

// === RÉCUPÉRER LES AVIS D'UN VOYAGE (ACTIFS SEULEMENT) ===
const getAvisByVoyage = async (req, res, next) => {
  try {
    const { voyageId } = req.params;

    const avis = await prisma.avis.findMany({
      where: {
        code_voyage_id: parseInt(voyageId),
        deleted_at: null
      },
      include: {
        client: {
          select: {
            utilisateur: {
              select: {
                nom: true,
                prenoms: true,
                photo_identite: true
              }
            }
          }
        }
      },
      orderBy: { date_avis: "desc" }
    });

    // Calculer la moyenne
    const moyenne = avis.length > 0
      ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(2)
      : "0.00";

    res.json({
      avis,
      count: avis.length,
      moyenne: parseFloat(moyenne)
    });
  } catch (err) {
    console.error("Erreur getAvisByVoyage:", err);
    next(err);
  }
};

export { createAvis, getAvisByVoyage };