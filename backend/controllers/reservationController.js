import crypto from 'crypto';
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === FONCTIONS UTILITAIRES ===
function genCode(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

function normalizePlaceNumber(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().toUpperCase();
}

const roundMoney = (n) => Math.round(Number(n || 0) * 100) / 100;

// ========================================
// 🆕 NOUVELLE ROUTE : CRÉER RÉSERVATION "EN ATTENTE"
// ========================================
const createPendingReservation = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Non authentifié." });
    }

    const code_client_id = req.user.id;
    const { code_voyage_id, places } = req.body;

    if (!code_voyage_id || !places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({
        error: "Données invalides: 'code_voyage_id' et 'places' requis."
      });
    }

    const seatNumbers = places.map(normalizePlaceNumber);
    const uniqueSeats = Array.from(new Set(seatNumbers));

    if (uniqueSeats.length !== seatNumbers.length) {
      const dupes = seatNumbers.filter((x, i) => seatNumbers.indexOf(x) !== i);
      return res.status(400).json({
        error: `Doublon(s) de place détecté(s): ${Array.from(new Set(dupes)).join(', ')}`
      });
    }

    const [client, voyage] = await Promise.all([
      prisma.client.findUnique({
        where: { id: code_client_id },
        include: { utilisateur: true }
      }),
      prisma.voyage.findUnique({
        where: { id: code_voyage_id },
        include: {
          voiture: {
            include: {
              places: { where: { numero: { in: uniqueSeats } } }
            }
          },
          trajet: true
        }
      })
    ]);

    if (!client) return res.status(404).json({ error: "Client non trouvé." });
    if (!voyage) return res.status(404).json({ error: "Voyage non trouvé." });
    if (!voyage.voiture) return res.status(400).json({ error: "Aucune voiture associée à ce voyage." });

    const fetchedPlaces = voyage.voiture.places || [];
    const fetchedNumsSet = new Set(fetchedPlaces.map(p => normalizePlaceNumber(p.numero)));
    const missing = uniqueSeats.filter(n => !fetchedNumsSet.has(n));

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Place(s) introuvable(s) pour ce voyage: ${missing.join(', ')}`
      });
    }

    const chauffeurSeats = fetchedPlaces.filter(p => p.est_chauffeur).map(p => p.numero);
    if (chauffeurSeats.length > 0) {
      return res.status(400).json({
        error: `Siège chauffeur non réservable: ${chauffeurSeats.join(', ')}`
      });
    }

    const alreadyReserved = fetchedPlaces.filter(p => p.est_reserve).map(p => p.numero);
    if (alreadyReserved.length > 0) {
      return res.status(409).json({
        error: `Déjà réservé(s): ${alreadyReserved.join(', ')}`
      });
    }

    const placeByNumero = new Map(
      fetchedPlaces.map(p => [normalizePlaceNumber(p.numero), p])
    );
    const seatIds = uniqueSeats.map(n => placeByNumero.get(n).id);

    const nom = client.utilisateur?.nom || '';
    const prenoms = client.utilisateur?.prenoms || '';
    const clientTelStr = client.utilisateur?.telephone;
    const clientTelInt = clientTelStr ? parseInt(clientTelStr, 10) : NaN;

    if (!nom) {
      return res.status(400).json({ error: "Nom du compte client manquant." });
    }
    if (isNaN(clientTelInt)) {
      return res.status(400).json({ error: "Téléphone du compte client invalide." });
    }

    const passagersData = uniqueSeats.map(() => ({
      code_passager: genCode('PASS'),
      code_voyage_id,
      code_client_id,
      nom,
      prenoms,
      telephone: clientTelInt,
      email: client.utilisateur?.email ?? null,
      numero_cin: null,
      date_naissance: null
    }));

    const resultat = await prisma.$transaction(async (tx) => {
      const updateRes = await tx.place_voiture.updateMany({
        where: {
          id: { in: seatIds },
          voiture_id: voyage.voiture.id,
          est_reserve: false,
          est_chauffeur: false
        },
        data: { est_reserve: true }
      });

      if (updateRes.count !== seatIds.length) {
        throw new Error('CONFLICT_SEATS');
      }

      const reservation = await tx.reservation.create({
        data: {
          code_trajet_id: voyage.code_trajet_id,
          code_voyage_id,
          code_client_id,
          code_reservation: genCode('RES'),
          date_reservation: new Date(),
          statut: 'en attente',
          nombre_places: uniqueSeats.length,
          places: {
            create: seatIds.map(id => ({ place_id: id }))
          }
        },
        include: {
          places: { include: { place: true } }
        }
      });

      await tx.passager.createMany({ data: passagersData });

      return { reservation };
    });

    const montantTotal = roundMoney(voyage.prix * uniqueSeats.length);

    return res.status(201).json({
      success: true,
      message: "Réservation en attente créée avec succès.",
      reservation: {
        id: resultat.reservation.id,
        code_reservation: resultat.reservation.code_reservation,
        statut: resultat.reservation.statut,
        nombre_places: resultat.reservation.nombre_places,
        places: uniqueSeats,
        // ✅ utiles pour échelonné (sans casser le front)
        montant_total: montantTotal,
        montant_paye: 0,
        montant_restant: montantTotal,
        voyage: {
          id: voyage.id,
          code: voyage.code_voyage,
          date_depart: voyage.date_depart,
          heure_depart: voyage.heure_depart,
          prix: voyage.prix,
          trajet: {
            depart: voyage.trajet.station_depart,
            arrivee: voyage.trajet.station_arrivee
          }
        }
      }
    });

  } catch (err) {
    if (err.message === 'CONFLICT_SEATS') {
      return res.status(409).json({
        error: "Une ou plusieurs places viennent d'être réservées par un autre utilisateur."
      });
    }

    console.error('Erreur createPendingReservation:', err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

// ========================================
// ANCIENNE ROUTE : CRÉER RÉSERVATION "CONFIRMÉE" (CONSERVÉE)
// ========================================
const createReservation = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Non authentifié." });
    }

    const code_client_id = req.user.id;
    const { code_voyage_id } = req.body;
    const bodyPassagers = Array.isArray(req.body.passagers) ? req.body.passagers : null;
    const bodyPlaces = Array.isArray(req.body.places) ? req.body.places : null;

    if (!code_voyage_id || (!bodyPassagers && (!bodyPlaces || bodyPlaces.length === 0))) {
      return res.status(400).json({ error: "Données invalides: 'code_voyage_id' et 'passagers' ou 'places' requis." });
    }

    let seatNumbers = [];
    if (bodyPassagers && bodyPassagers.length > 0) {
      seatNumbers = bodyPassagers.map(p => normalizePlaceNumber(p.place ?? p.numero_place ?? p.numero));
      if (seatNumbers.some(n => !n)) {
        return res.status(400).json({ error: "Chaque passager doit avoir une propriété 'place'." });
      }
    } else if (bodyPlaces) {
      seatNumbers = bodyPlaces.map(normalizePlaceNumber);
    }

    const uniqueSeats = Array.from(new Set(seatNumbers));
    if (uniqueSeats.length !== seatNumbers.length) {
      const dupes = seatNumbers.filter((x, i) => seatNumbers.indexOf(x) !== i);
      return res.status(400).json({ error: `Doublon(s) de place détecté(s): ${Array.from(new Set(dupes)).join(', ')}` });
    }

    const [client, voyage] = await Promise.all([
      prisma.client.findUnique({
        where: { id: code_client_id },
        include: { utilisateur: true }
      }),
      prisma.voyage.findUnique({
        where: { id: code_voyage_id },
        include: {
          voiture: {
            include: {
              places: { where: { numero: { in: uniqueSeats } } }
            }
          }
        }
      })
    ]);

    if (!client) return res.status(404).json({ error: "Client non trouvé." });
    if (!voyage) return res.status(404).json({ error: "Voyage non trouvé." });
    if (!voyage.voiture) return res.status(400).json({ error: "Aucune voiture associée à ce voyage." });

    const fetchedPlaces = voyage.voiture.places || [];
    const fetchedNumsSet = new Set(fetchedPlaces.map(p => normalizePlaceNumber(p.numero)));
    const missing = uniqueSeats.filter(n => !fetchedNumsSet.has(n));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Place(s) introuvable(s) pour ce voyage: ${missing.join(', ')}` });
    }

    const chauffeurSeats = fetchedPlaces.filter(p => p.est_chauffeur).map(p => p.numero);
    if (chauffeurSeats.length > 0) {
      return res.status(400).json({ error: `Siège chauffeur non réservable: ${chauffeurSeats.join(', ')}` });
    }

    const alreadyReserved = fetchedPlaces.filter(p => p.est_reserve).map(p => p.numero);
    if (alreadyReserved.length > 0) {
      return res.status(409).json({ error: `Déjà réservé(s): ${alreadyReserved.join(', ')}` });
    }

    const placeByNumero = new Map(
      fetchedPlaces.map(p => [normalizePlaceNumber(p.numero), p])
    );
    const seatIds = uniqueSeats.map(n => placeByNumero.get(n).id);

    const clientTelStr = client.utilisateur?.telephone;
    const clientTelInt = clientTelStr ? parseInt(clientTelStr, 10) : NaN;

    let passagersData;

    if (bodyPassagers && bodyPassagers.length > 0) {
      const passagerBySeat = new Map();
      for (const p of bodyPassagers) {
        const key = normalizePlaceNumber(p.place ?? p.numero_place ?? p.numero);
        passagerBySeat.set(key, p);
      }

      passagersData = uniqueSeats.map(seat => {
        const p = passagerBySeat.get(seat);
        const nom = p?.nom;
        const prenoms = p?.prenoms || '';
        const telParsed = p?.telephone ? parseInt(p.telephone, 10) : clientTelInt;

        if (!nom) {
          throw new Error(`PASSAGER_DATA_INVALID: Le nom est requis pour la place ${seat}.`);
        }
        if (isNaN(telParsed)) {
          throw new Error(`PASSAGER_DATA_INVALID: Téléphone manquant/invalide pour la place ${seat}.`);
        }

        return {
          code_passager: genCode('PASS'),
          code_voyage_id,
          code_client_id,
          nom,
          prenoms,
          telephone: telParsed,
          email: p?.email ?? null,
          numero_cin: p?.numero_cin ? parseInt(p.numero_cin, 10) : null,
          date_naissance: p?.date_naissance ? new Date(p.date_naissance) : null
        };
      });
    } else {
      const nom = client.utilisateur?.nom || '';
      const prenoms = client.utilisateur?.prenoms || '';
      const telParsed = clientTelInt;

      if (!nom) {
        return res.status(400).json({ error: "Nom du compte client manquant." });
      }
      if (isNaN(telParsed)) {
        return res.status(400).json({ error: "Téléphone du compte client invalide." });
      }

      passagersData = uniqueSeats.map(() => ({
        code_passager: genCode('PASS'),
        code_voyage_id,
        code_client_id,
        nom,
        prenoms,
        telephone: telParsed,
        email: client.utilisateur?.email ?? null,
        numero_cin: null,
        date_naissance: null
      }));
    }

    const resultat = await prisma.$transaction(async (tx) => {
      const updateRes = await tx.place_voiture.updateMany({
        where: {
          id: { in: seatIds },
          voiture_id: voyage.voiture.id,
          est_reserve: false,
          est_chauffeur: false
        },
        data: { est_reserve: true }
      });

      if (updateRes.count !== seatIds.length) {
        throw new Error('CONFLICT_SEATS');
      }

      const reservation = await tx.reservation.create({
        data: {
          code_trajet_id: voyage.code_trajet_id,
          code_voyage_id,
          code_client_id,
          code_reservation: genCode('RES'),
          date_reservation: new Date(),
          statut: 'confirmee',
          nombre_places: uniqueSeats.length,
          places: {
            create: seatIds.map(id => ({ place_id: id }))
          }
        },
        include: {
          places: { include: { place: true } },
          client: { include: { utilisateur: true } }
        }
      });

      const created = await tx.passager.createMany({ data: passagersData });

      return { reservation, createdCount: created.count };
    });

    return res.status(201).json({
      message: "Réservation et passagers créés avec succès.",
      reservation: {
        id: resultat.reservation.id,
        code_reservation: resultat.reservation.code_reservation,
        statut: resultat.reservation.statut,
        nombre_places: resultat.reservation.nombre_places,
        places: uniqueSeats,
        passagers: passagersData.map((p, idx) => ({
          code_passager: p.code_passager,
          nom: p.nom,
          prenoms: p.prenoms,
          place: uniqueSeats[idx]
        }))
      }
    });

  } catch (err) {
    if (typeof err.message === 'string') {
      if (err.message.startsWith('PASSAGER_DATA_INVALID')) {
        return res.status(400).json({ error: err.message.replace('PASSAGER_DATA_INVALID: ', '') });
      }
      if (err.message === 'CONFLICT_SEATS') {
        return res.status(409).json({ error: "Une ou plusieurs places viennent d'être réservées par un autre utilisateur. Veuillez réessayer." });
      }
    }

    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Conflit de contrainte unique." });
    }

    console.error('Erreur createReservation:', err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

// ========================================
// ✅ GET RESERVATIONS (avec montant_total / payé / restant)
// ========================================
const getReservations = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        code_client_id: clientId,
      },
      include: {
        trajet: true,
        voyage: {
          include: {
            trajet: true,
            voiture: true,
            cooperative: true
          }
        },
        places: {
          include: {
            place: {
              select: {
                numero: true,
                id: true
              }
            }
          }
        },
        // ✅ On ne garde que les paiements valides, non supprimés, triés du plus récent au plus ancien
        paiement: {
          where: {
            deleted_at: null,
            status: 'valide'
          },
          orderBy: {
            date_paiement: 'desc'
          }
        },
        recu: true
      },
      orderBy: { date_reservation: "desc" }
    });

    const formattedReservations = reservations.map(reservation => {
      const montantTotal = roundMoney(reservation.nombre_places * reservation.voyage.prix);
      const montantPaye = roundMoney(
        (reservation.paiement || []).reduce((sum, p) => sum + Number(p.montant || 0), 0)
      );
      const montantRestant = roundMoney(montantTotal - montantPaye);

      return {
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        date_reservation: reservation.date_reservation,
        statut: reservation.statut,
        nombre_places: reservation.nombre_places,
        places: reservation.places.map(p => p.place.numero),
        voyage: {
          id: reservation.voyage.id,
          code: reservation.voyage.code_voyage,
          date_depart: reservation.voyage.date_depart,
          heure_depart: reservation.voyage.heure_depart,
          prix: reservation.voyage.prix,
          trajet: {
            depart: reservation.voyage.trajet.station_depart,
            arrivee: reservation.voyage.trajet.station_arrivee,
            distance: reservation.voyage.trajet.distance
          },
          voiture: {
            modele: reservation.voyage.voiture.modele,
            immatriculation: reservation.voyage.voiture.immatriculation,
            capacite: reservation.voyage.voiture.capacite
          },
          cooperative: {
            nom: reservation.voyage.cooperative.nom
          }
        },

        // ✅ Nouvelles infos utiles
        montant_total: montantTotal,
        montant_paye: montantPaye,
        montant_restant: montantRestant,

        // ✅ Paiements (tous)
        paiements: reservation.paiement,

        // ✅ Compatibilité: on donne le dernier paiement (le plus récent)
        paiement: reservation.paiement.length > 0 ? reservation.paiement[0] : null,

        recu: reservation.recu.length > 0 ? reservation.recu[0] : null
      };
    });

    res.status(200).json({
      success: true,
      count: formattedReservations.length,
      reservations: formattedReservations
    });

  } catch (error) {
    console.error("Erreur getReservations:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des réservations",
      details: error.message
    });
  }
};

// === ANNULER UNE RÉSERVATION ===
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        places: { include: { place: true } },
        voyage: { include: { voiture: true } }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    if (reservation.code_client_id !== clientId) {
      return res.status(403).json({ error: "Non autorisé à annuler cette réservation" });
    }

    if (reservation.statut === "annulee" || reservation.statut === "annulée") {
      return res.status(400).json({ error: "Réservation déjà annulée" });
    }

    await prisma.$transaction(async (tx) => {
      const placeIds = reservation.places.map(rp => rp.place.id);

      await tx.place_voiture.updateMany({
        where: {
          id: { in: placeIds },
          voiture_id: reservation.voyage.voiture.id
        },
        data: { est_reserve: false }
      });

      await tx.reservation.update({
        where: { id: parseInt(id) },
        data: { statut: "annulée" }
      });
    });

    res.json({
      success: true,
      message: "Réservation annulée avec succès"
    });

  } catch (err) {
    console.error("Erreur cancelReservation:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'annulation",
      details: err.message
    });
  }
};

// ========================================
// ✅ HISTORIQUE (confirmées + voyage terminé)
// ========================================
const getHistoriqueReservations = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise"
      });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        code_client_id: clientId,
        statut: {
          in: ["confirmee", "confirmée"]
        },
        voyage: {
          status: {
            in: ["terminée", "terminé", "termine"]
          }
        }
      },
      include: {
        trajet: true,
        voyage: {
          include: {
            trajet: true,
            voiture: true,
            cooperative: true,
            avis: {
              where: { code_client_id: clientId }
            }
          }
        },
        places: {
          include: {
            place: {
              select: {
                numero: true,
                id: true
              }
            }
          }
        },
        paiement: {
          where: {
            deleted_at: null,
            status: 'valide'
          },
          orderBy: {
            date_paiement: 'desc'
          }
        },
        recu: true
      },
      orderBy: {
        date_reservation: "desc"
      }
    });

    const formattedReservations = reservations.map(reservation => {
      const montantTotal = roundMoney(reservation.nombre_places * reservation.voyage.prix);
      const montantPaye = roundMoney(
        (reservation.paiement || []).reduce((sum, p) => sum + Number(p.montant || 0), 0)
      );
      const montantRestant = roundMoney(montantTotal - montantPaye);

      return {
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        date_reservation: reservation.date_reservation,
        statut: reservation.statut,
        nombre_places: reservation.nombre_places,
        places: reservation.places.map(p => p.place.numero),
        voyage: {
          id: reservation.voyage.id,
          code: reservation.voyage.code_voyage,
          date_depart: reservation.voyage.date_depart,
          heure_depart: reservation.voyage.heure_depart,
          prix: reservation.voyage.prix,
          trajet: {
            depart: reservation.voyage.trajet.station_depart,
            arrivee: reservation.voyage.trajet.station_arrivee,
            distance: reservation.voyage.trajet.distance
          },
          voiture: {
            modele: reservation.voyage.voiture.modele,
            immatriculation: reservation.voyage.voiture.immatriculation
          },
          cooperative: {
            nom: reservation.voyage.cooperative.nom
          }
        },
        avis_donne: reservation.voyage.avis && reservation.voyage.avis.length > 0,

        // ✅ montants (historique = normalement restant = 0)
        montant_total: montantTotal,
        montant_paye: montantPaye,
        montant_restant: montantRestant,

        paiements: reservation.paiement,
        paiement: reservation.paiement.length > 0 ? reservation.paiement[0] : null,
        recu: reservation.recu.length > 0 ? reservation.recu[0] : null
      };
    });

    res.status(200).json({
      success: true,
      count: formattedReservations.length,
      reservations: formattedReservations
    });

  } catch (error) {
    console.error("Erreur getHistoriqueReservations:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'historique",
      details: error.message
    });
  }
};

export {
  createPendingReservation,
  createReservation,
  getReservations,
  cancelReservation,
  getHistoriqueReservations
};