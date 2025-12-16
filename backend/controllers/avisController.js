// controllers/avisController.js
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// ==========================================
// CRÉER UN AVIS (EXISTANT - NE PAS TOUCHER)
// ==========================================
const createAvis = async (req, res, next) => {
  try {
    const { code_voyage_id, note, commentaire } = req.body;

    // ✅ Sécurité : on utilise l'ID du token JWT, pas celui du body
    const code_client_id = req.user?.id;
    if (!code_client_id) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // ✅ Validation
    if (!code_voyage_id || note === undefined) {
      return res.status(400).json({ error: "L'ID du voyage et la note sont requis" });
    }
    if (typeof note !== 'number' || note < 1 || note > 5) {
      return res.status(400).json({ error: "La note doit être un nombre entre 1 et 5" });
    }

    // ✅ Vérifier que le voyage existe et est terminé
    const voyage = await prisma.voyage.findUnique({
      where: { id: Number(code_voyage_id) }
    });
    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    // ✅ Gérer toutes les variantes de "terminé"
    const voyageStatus = (voyage.status || "").toLowerCase();
    if (voyageStatus !== 'terminée' && voyageStatus !== 'terminé' && voyageStatus !== 'termine') {
      return res.status(400).json({ error: "Impossible de noter un voyage non terminé" });
    }

    // ✅ Vérifier que le client a bien réservé ce voyage
    const reservation = await prisma.reservation.findFirst({
      where: {
        code_voyage_id: Number(code_voyage_id),
        code_client_id: Number(code_client_id),
        statut: { in: ["confirmee", "confirmée"] }
      }
    });
    if (!reservation) {
      return res.status(403).json({ error: "Vous n'avez pas effectué ce voyage" });
    }

    // ✅ Empêcher de donner un avis deux fois
    const existingAvis = await prisma.avis.findFirst({
      where: {
        code_voyage_id: Number(code_voyage_id),
        code_client_id: Number(code_client_id)
      }
    });
    if (existingAvis) {
      return res.status(409).json({ error: "Vous avez déjà laissé un avis pour ce voyage" });
    }

    // Créer la référence de l'avis
    const ref_avis = `AVIS-${Date.now()}`;

    // ✅ Créer l'avis
    const avis = await prisma.avis.create({
      data: {
        code_voyage_id: Number(code_voyage_id),
        code_client_id: Number(code_client_id),
        ref_avis,
        note: Number(note),
        commentaire: commentaire?.toString().trim() || null,
        date_avis: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: "Merci pour votre avis !",
      avis
    });
  } catch (err) {
    console.error("Erreur createAvis:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'enregistrement de l'avis",
      details: err.message
    });
  }
};

// ==========================================
// RÉCUPÉRER LES AVIS D'UN VOYAGE (EXISTANT - NE PAS TOUCHER)
// ==========================================
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

// ==========================================
// LISTE DES AVIS LES PLUS RÉCENTS (EXISTANT - NE PAS TOUCHER)
// ==========================================
const getLatestAvis = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ?limit=5

    const avis = await prisma.avis.findMany({
      where: {
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
        },
        voyage: {
          select: {
            code_voyage: true,
            date_depart: true,
            trajet: {
              select: {
                station_depart: true,
                station_arrivee: true
              }
            }
          }
        }
      },
      orderBy: {
        date_avis: "desc"
      },
      take: limit
    });

    // Formater la réponse
    const formattedAvis = avis.map(a => ({
      id: a.id,
      note: a.note,
      commentaire: a.commentaire,
      date_avis: a.date_avis,
      client: {
        nom_complet: `${a.client.utilisateur.prenoms || ""} ${a.client.utilisateur.nom}`.trim(),
        photo: a.client.utilisateur.photo_identite
      },
      voyage: {
        code: a.voyage.code_voyage,
        trajet: `${a.voyage.trajet.station_depart} → ${a.voyage.trajet.station_arrivee}`,
        date: a.voyage.date_depart
      }
    }));

    res.json({
      count: formattedAvis.length,
      avis: formattedAvis
    });
  } catch (error) {
    console.error("Erreur getLatestAvis:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 👇 NOUVELLE FONCTION : AVIS PAR COOPÉRATIVE (AJOUT)
// ==========================================
const getAvisByCooperative = async (req, res, next) => {
  try {
    const { cooperativeId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const avis = await prisma.avis.findMany({
      where: {
        deleted_at: null,
        voyage: {
          code_cooperative_id: parseInt(cooperativeId)
        }
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
        },
        voyage: {
          select: {
            id: true,
            code_voyage: true,
            date_depart: true,
            trajet: {
              select: {
                station_depart: true,
                station_arrivee: true
              }
            }
          }
        }
      },
      orderBy: {
        date_avis: "desc"
      },
      take: limit
    });

    // Calculer la moyenne
    const moyenne = avis.length > 0
      ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length)
      : 0;

    // Calculer la répartition des notes
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    avis.forEach(a => {
      const note = Math.round(a.note);
      if (note >= 1 && note <= 5) {
        distribution[note]++;
      }
    });

    // Formater la réponse
    const formattedAvis = avis.map(a => ({
      id: a.id,
      ref_avis: a.ref_avis,
      note: a.note,
      commentaire: a.commentaire,
      date_creation: a.date_avis,
      client: {
        nom: a.client?.utilisateur?.nom || 'Utilisateur',
        prenom: a.client?.utilisateur?.prenoms || '',
        photo: a.client?.utilisateur?.photo_identite || null
      },
      voyage: a.voyage ? {
        id: a.voyage.id,
        code: a.voyage.code_voyage,
        date: a.voyage.date_depart,
        trajet: a.voyage.trajet 
          ? `${a.voyage.trajet.station_depart} → ${a.voyage.trajet.station_arrivee}`
          : null
      } : null
    }));

    res.json({
      avis: formattedAvis,
      count: avis.length,
      moyenne: parseFloat(moyenne.toFixed(2)),
      distribution
    });
  } catch (error) {
    console.error("Erreur getAvisByCooperative:", error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des avis de la coopérative",
      details: error.message 
    });
  }
};

// ==========================================
// EXPORT (TOUT EXPORTER)
// ==========================================
export { 
  createAvis, 
  getAvisByVoyage, 
  getLatestAvis,
  getAvisByCooperative 
};