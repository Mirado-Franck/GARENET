import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === CRÉER UN PAIEMENT ===
const createPaiement = async (req, res, next) => {
  try {
    const {
      code_reservation_id,
      montant,
      mode_paiement,
      payement_restant // Optionnel : si paiement partiel
    } = req.body;

    // === VALIDATION ===
    if (!code_reservation_id || !montant || !mode_paiement) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    // === VÉRIFIER LA RÉSERVATION ===
    const reservation = await prisma.reservation.findUnique({
      where: { id: code_reservation_id },
      include: {
        voyage: true,
        paiement: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    if (reservation.statut === "confirmee") {
      return res.status(400).json({ error: "Réservation déjà payée" });
    }

    if (reservation.statut === "annulee") {
      return res.status(400).json({ error: "Réservation annulée" });
    }

    // === CALCUL DU MONTANT TOTAL ET RESTANT ===
    const totalDu = reservation.voyage.prix * reservation.nombre_places;
    const dejaPaye = reservation.paiement.reduce((sum, p) => sum + p.montant, 0);
    const montantDu = totalDu - dejaPaye;

    if (montant > montantDu) {
      return res.status(400).json({
        error: "Montant supérieur au dû",
        montant_du: montantDu
      });
    }

    // === GÉNÉRER code_paiement ===
    const code_paiement = `PAY${Date.now()}${Math.floor(Math.random() * 100)}`;

    // === CRÉER LE PAIEMENT ===
    const paiement = await prisma.paiement.create({
      data: {
        code_reservation_id,
        code_paiement,
        montant: parseFloat(montant),
        mode_paiement,
        date_paiement: new Date(),
        status: "valide",
        paiement_restant: payement_restant !== undefined ? parseFloat(payement_restant) : (montantDu - montant)
      },
      include: {
        reservation: {
          include: {
            client: true,
            voyage: true
          }
        }
      }
    });

    // === METTRE À JOUR LE STATUT DE LA RÉSERVATION ===
    const nouveauRestant = montantDu - montant;
    let nouveauStatut = reservation.statut;

    if (nouveauRestant <= 0) {
      nouveauStatut = "confirmee";
    } else if (montant > 0) {
      nouveauStatut = "payee_partiellement";
    }

    await prisma.reservation.update({
      where: { id: code_reservation_id },
      data: { statut: nouveauStatut }
    });

    res.status(201).json({
      message: "Paiement enregistré avec succès",
      paiement,
      montant_restant: nouveauRestant
    });
  } catch (err) {
    console.error("Erreur createPaiement:", err);
    next(err);
  }
};

// === RÉCUPÉRER LES PAIEMENTS D'UN CLIENT ===
const getPaiements = async (req, res, next) => {
  try {
    const clientId = req.user?.id || req.body.code_client_id; // À adapter avec auth
    if (!clientId) {
      return res.status(400).json({ error: "ID client manquant" });
    }

    const paiements = await prisma.paiement.findMany({
      where: {
        reservation: {
          code_client_id: clientId
        },
        deleted_at: null
      },
      include: {
        reservation: {
          include: {
            voyage: { include: { trajet: true } },
            places: { include: { place: true } }
          }
        }
      },
      orderBy: { date_paiement: "desc" }
    });

    res.json(paiements);
  } catch (err) {
    console.error("Erreur getPaiements:", err);
    next(err);
  }
};

export { createPaiement, getPaiements };