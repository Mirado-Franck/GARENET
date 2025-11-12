import crypto from 'crypto';
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === FONCTIONS UTILITAIRES (MANQUANTES DANS VOTRE CODE) ===
function genCode(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

function normalizePlaceNumber(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().toUpperCase();
}

// === CRÉATION RÉSERVATION + PASSAGERS (ROBUSTE) ===
const createReservation = async (req, res, next) => {
  try {
    // Auth obligatoire
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

    // Déterminer les numéros de places demandées
    let seatNumbers = [];
    if (bodyPassagers && bodyPassagers.length > 0) {
      seatNumbers = bodyPassagers.map(p => normalizePlaceNumber(p.place ?? p.numero_place ?? p.numero));
      if (seatNumbers.some(n => !n)) {
        return res.status(400).json({ error: "Chaque passager doit avoir une propriété 'place' (ou 'numero' / 'numero_place')." });
      }
    } else if (bodyPlaces) {
      seatNumbers = bodyPlaces.map(normalizePlaceNumber);
    }

    // Vérif doublons
    const uniqueSeats = Array.from(new Set(seatNumbers));
    if (uniqueSeats.length !== seatNumbers.length) {
      const dupes = seatNumbers.filter((x, i) => seatNumbers.indexOf(x) !== i);
      return res.status(400).json({ error: `Doublon(s) de place détecté(s): ${Array.from(new Set(dupes)).join(', ')}` });
    }

    // Charger client + voyage/voiture/places requises
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

    // Vérifier que toutes les places existent pour cette voiture
    const fetchedPlaces = voyage.voiture.places || [];
    const fetchedNumsSet = new Set(fetchedPlaces.map(p => normalizePlaceNumber(p.numero)));
    const missing = uniqueSeats.filter(n => !fetchedNumsSet.has(n));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Place(s) introuvable(s) pour ce voyage: ${missing.join(', ')}` });
    }

    // Vérifier chauffeur / déjà réservées
    const chauffeurSeats = fetchedPlaces.filter(p => p.est_chauffeur).map(p => p.numero);
    if (chauffeurSeats.length > 0) {
      return res.status(400).json({ error: `Siège chauffeur non réservable: ${chauffeurSeats.join(', ')}` });
    }

    const alreadyReserved = fetchedPlaces.filter(p => p.est_reserve).map(p => p.numero);
    if (alreadyReserved.length > 0) {
      return res.status(409).json({ error: `Déjà réservé(s): ${alreadyReserved.join(', ')}` });
    }

    // Map numero -> place, pour récupérer les IDs
    const placeByNumero = new Map(
      fetchedPlaces.map(p => [normalizePlaceNumber(p.numero), p])
    );
    const seatIds = uniqueSeats.map(n => placeByNumero.get(n).id);

    // Préparer les données des passagers
    // Téléphone du client (fallback)
    const clientTelStr = client.utilisateur?.telephone;
    const clientTelInt = clientTelStr ? parseInt(clientTelStr, 10) : NaN;

    let passagersData;

    if (bodyPassagers && bodyPassagers.length > 0) {
      // Indexer les passagers par place normalisée
      const passagerBySeat = new Map();
      for (const p of bodyPassagers) {
        const key = normalizePlaceNumber(p.place ?? p.numero_place ?? p.numero);
        passagerBySeat.set(key, p);
      }

      // Construire la liste dans l'ordre des places demandées
      passagersData = uniqueSeats.map(seat => {
        const p = passagerBySeat.get(seat);
        // Champs requis: nom, telephone (sinon fallback client)
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
          // NOTE: pas de numero_place dans le schéma -> on ne l'insère pas
        };
      });
    } else {
      // Mode simple: une entrée par place, infos depuis le compte client
      const nom = client.utilisateur?.nom || '';
      const prenoms = client.utilisateur?.prenoms || '';
      const telParsed = clientTelInt;

      if (!nom) {
        return res.status(400).json({ error: "Nom du compte client manquant; impossible de créer les passagers." });
      }
      if (isNaN(telParsed)) {
        return res.status(400).json({ error: "Téléphone du compte client invalide; fournissez 'passagers' avec un téléphone pour chaque passager." });
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

    // Lancer la transaction: verrouillage places -> création réservation -> création passagers
    const resultat = await prisma.$transaction(async (tx) => {
      // 1) Verrouiller (réserver) les places de manière atomique
      const updateRes = await tx.place_voiture.updateMany({
        where: {
          id: { in: seatIds },
          est_reserve: false,
          est_chauffeur: false
        },
        data: { est_reserve: true }
      });

      if (updateRes.count !== seatIds.length) {
        // Conflit de concurrence: une place vient d'être prise
        throw new Error('CONFLICT_SEATS');
      }

      // 2) Créer la réservation + lignes reservation_place
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
            create: seatIds.map(id => ({
              place_id: id  // CORRECTION: utiliser place_id au lieu de place.connect
            }))
          }
        },
        include: {
          places: { include: { place: true } },
          client: { include: { utilisateur: true } }
        }
      });

      // 3) Créer les passagers
      const created = await tx.passager.createMany({
        data: passagersData
      });

      return { reservation, createdCount: created.count };
    });

    // Réponse
    return res.status(201).json({
      message: "Réservation et passagers créés avec succès.",
      reservation: {
        id: resultat.reservation.id,
        code_reservation: resultat.reservation.code_reservation,
        statut: resultat.reservation.statut,
        nombre_places: resultat.reservation.nombre_places,
        places: uniqueSeats, // numéros de places réservées
        passagers: passagersData.map((p, idx) => ({
          code_passager: p.code_passager,
          nom: p.nom,
          prenoms: p.prenoms,
          place: uniqueSeats[idx] // rappel: le modèle Passager n'a pas de champ 'numero_place'
        }))
      }
    });

  } catch (err) {
    // Gestion fine des erreurs
    if (typeof err.message === 'string') {
      if (err.message.startsWith('PASSAGER_DATA_INVALID')) {
        return res.status(400).json({ error: err.message.replace('PASSAGER_DATA_INVALID: ', '') });
      }
      if (err.message === 'CONFLICT_SEATS') {
        return res.status(409).json({ error: "Une ou plusieurs places viennent d'être réservées par un autre utilisateur. Veuillez réessayer." });
      }
    }

    // Prisma P2002 (violations unique) etc.
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Conflit de contrainte unique (probablement une place déjà associée à la réservation)." });
    }

    console.error('Erreur createReservation:', err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

// === RÉCUPÉRER TOUTES LES RÉSERVATIONS DU CLIENT CONNECTÉ ===
const getReservations = async (req, res, next) => {
  try {
    // ✅ Récupérer l'ID client depuis le JWT (req.user ajouté par authMiddleware)
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
        // ✅ Optionnel : exclure les réservations annulées
        // statut: { not: "annulee" }
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
        paiement: true,
        recu: true
      },
      orderBy: { date_reservation: "desc" }
    });

    // ✅ Formater la réponse pour le frontend
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      code_reservation: reservation.code_reservation,
      date_reservation: reservation.date_reservation,
      statut: reservation.statut,
      nombre_places: reservation.nombre_places,
      places: reservation.places.map(p => p.place.numero), // ["A1", "B3"]
      voyage: {
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
      paiement: reservation.paiement.length > 0 ? reservation.paiement[0] : null,
      recu: reservation.recu.length > 0 ? reservation.recu[0] : null
    }));

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
    const clientId = req.user.id; // AJOUT: Vérifier que c'est le bon client

    // ✅ CORRECTION : Inclure voyage pour avoir code_voiture_id
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { 
        places: { include: { place: true } },
        voyage: true  // ✅ AJOUT : Inclure voyage
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // AJOUT: Vérifier que c'est bien la réservation du client connecté
    if (reservation.code_client_id !== clientId) {
      return res.status(403).json({ error: "Non autorisé à annuler cette réservation" });
    }

    if (reservation.statut === "annulee") {
      return res.status(400).json({ error: "Réservation déjà annulée" });
    }

    // Transaction pour garantir l'atomicité
    await prisma.$transaction(async (tx) => {
      // === LIBÉRER LES PLACES ===
      const placeIds = reservation.places.map(rp => rp.place.id);

      await tx.place_voiture.updateMany({
        where: {
          id: { in: placeIds }
        },
        data: { est_reserve: false }
      });

      // === METTRE À JOUR LE STATUT ===
      await tx.reservation.update({
        where: { id: parseInt(id) },
        data: { statut: "annulee" }
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

// === RÉCUPÉRER L'HISTORIQUE DES RÉSERVATIONS (TERMINÉES) ===
const getHistoriqueReservations = async (req, res, next) => {
  try {
    // Récupérer l'ID client depuis le JWT
    const clientId = req.user.id;

    if (!clientId) {
      return res.status(401).json({ 
        success: false,
        error: "Authentification requise" 
      });
    }

    // Récupérer les réservations confirmées dont le voyage est terminé
    const reservations = await prisma.reservation.findMany({
      where: { 
        code_client_id: clientId,
        statut: {
          in: ["confirmee", "confirmée"]  // ✅ Réservation confirmée (avec/sans accent)
        },
        voyage: {
          status: {
            in: ["terminée", "terminé", "termine"]  // ✅ Voyage terminé (toutes variantes)
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
              where: {
                code_client_id: clientId  // ✅ Avis de ce client uniquement
              }
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
        paiement: true,
        recu: true
      },
      orderBy: { 
        date_reservation: "desc"  // ✅ Plus récent en premier
      }
    });

    // Formater la réponse
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      code_reservation: reservation.code_reservation,
      date_reservation: reservation.date_reservation,
      statut: reservation.statut,
      nombre_places: reservation.nombre_places,
      places: reservation.places.map(p => p.place.numero),
      voyage: {
        id: reservation.voyage.id,  // ✅ ID du voyage pour la page avis
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
      avis_donne: reservation.voyage.avis && reservation.voyage.avis.length > 0,  // ✅ Avis donné ?
      paiement: reservation.paiement.length > 0 ? reservation.paiement[0] : null,
      recu: reservation.recu.length > 0 ? reservation.recu[0] : null
    }));

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
  createReservation,
  getReservations,
  cancelReservation,
  getHistoriqueReservations
};