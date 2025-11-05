import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === CRÉATION D'UNE RÉSERVATION ===
const createReservation = async (req, res, next) => {


 

  try {

    // ✅ LOGS DE DEBUG
    //console.log('📦 Body reçu:', req.body);
    //console.log('👤 User JWT:', req.user);
    
    const {
      code_voyage_id,
      places,
    } = req.body;

    console.log('🔍 code_voyage_id:', code_voyage_id, 'Type:', typeof code_voyage_id);
    console.log('🔍 places:', places, 'IsArray:', Array.isArray(places));


    // ✅ Récupérer l'ID client depuis le JWT (req.user est ajouté par authMiddleware)
    const code_client_id = req.user.id;

    // === VALIDATION ===
    if (!code_voyage_id || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: "Données manquantes ou invalides" });
    }

    const nombre_places = places.length;

    // === VÉRIFIER QUE LE VOYAGE EXISTE ===
    const voyage = await prisma.voyage.findUnique({
      where: { id: code_voyage_id },
      include: { 
        voiture: { 
          include: { places: true } 
        },
        trajet: true
      }
    });

    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    // === VÉRIFIER LES PLACES DISPONIBLES ===
    const voiturePlaces = voyage.voiture.places;
    const placeMap = new Map(voiturePlaces.map(p => [p.numero, p]));

    const invalidPlaces = [];
    const reservedPlaces = [];
    const placeIds = []; // ✅ Stocker les IDs des places pour la création

    for (const numero of places) {
      const place = placeMap.get(numero);
      if (!place) {
        invalidPlaces.push(numero);
      } else if (place.est_chauffeur) {
        invalidPlaces.push(`${numero} (siège chauffeur)`);
      } else if (place.est_reserve) {
        reservedPlaces.push(numero);
      } else {
        placeIds.push(place.id); // ✅ Place valide
      }
    }

    if (invalidPlaces.length > 0) {
      return res.status(400).json({
        error: "Places invalides ou indisponibles",
        details: invalidPlaces
      });
    }

    if (reservedPlaces.length > 0) {
      return res.status(409).json({
        error: "Certaines places sont déjà réservées",
        details: reservedPlaces
      });
    }

    // === CRÉER LA RÉSERVATION (TRANSACTION) ===
    const code_reservation = `RES${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const reservation = await prisma.$transaction(async (tx) => {
      // 1. Créer la réservation
      const newReservation = await tx.reservation.create({
        data: {
          code_trajet_id: voyage.code_trajet_id,
          code_voyage_id,
          code_client_id,
          code_reservation,
          date_reservation: new Date(),
          statut: "confirmee", // ✅ ou "en_attente" selon ta logique
          nombre_places,
          // ✅ Créer les liens avec les places
          places: {
            create: placeIds.map(place_id => ({
              place_id
            }))
          }
        },
        include: {
          places: { 
            include: { place: true } 
          },
          voyage: {
            include: {
              trajet: true,
              voiture: true
            }
          },
          client: {
            include: {
              utilisateur: {
                select: {
                  nom: true,
                  prenoms: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // 2. Marquer les places comme réservées
      await tx.place_voiture.updateMany({
        where: {
          id: { in: placeIds }
        },
        data: { est_reserve: true }
      });

      return newReservation;
    });

    res.status(201).json({
      message: "Réservation créée avec succès",
      reservation: {
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        date_reservation: reservation.date_reservation,
        statut: reservation.statut,
        nombre_places: reservation.nombre_places,
        places: reservation.places.map(p => p.place.numero),
        voyage: {
          code: reservation.voyage.code_voyage,
          trajet: `${reservation.voyage.trajet.station_depart} → ${reservation.voyage.trajet.station_arrivee}`,
          date_depart: reservation.voyage.date_depart,
          prix: reservation.voyage.prix
        },
        client: {
          nom: reservation.client.utilisateur.nom,
          prenoms: reservation.client.utilisateur.prenoms,
          email: reservation.client.utilisateur.email
        }
      }
    });
  } catch (err) {
    console.error("Erreur création réservation:", err);
    res.status(500).json({ 
      error: "Erreur lors de la création de la réservation",
      details: err.message 
    });
  }
};

// === RÉCUPÉRER TOUTES LES RÉSERVATIONS D'UN CLIENT ===
const getReservations = async (req, res, next) => {
  try {
    const clientId = req.user?.id || req.body.code_client_id; // À adapter avec auth
    if (!clientId) {
      return res.status(400).json({ error: "ID client manquant" });
    }

    const reservations = await prisma.reservation.findMany({
      where: { code_client_id: clientId },
      include: {
        trajet: true,
        voyage: true,
        paiement: true,
        recu: true,
        places: { include: { place: true } }
      },
      orderBy: { date_reservation: "desc" }
    });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

// === ANNULER UNE RÉSERVATION ===
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { places: { include: { place: true } } }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    if (reservation.statut === "annulee") {
      return res.status(400).json({ error: "Réservation déjà annulée" });
    }

    // === LIBÉRER LES PLACES ===
    const placeNumeros = reservation.places.map(rp => rp.place.numero);

    await prisma.place_voiture.updateMany({
      where: {
        voiture_id: reservation.voyage.code_voiture_id,
        numero: { in: placeNumeros }
      },
      data: { est_reserve: false }
    });

    // === METTRE À JOUR LE STATUT ===
    const updated = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { statut: "annulee" },
      include: { places: { include: { place: true } } }
    });

    res.json({
      message: "Réservation annulée",
      reservation: updated
    });
  } catch (err) {
    next(err);
  }
};

// === RÉCUPÉRER PAR CLIENT (via param) ===
const getReservationsByClient = async (req, res, next) => {
  try {
    const { utilisateurId } = req.params;

    // On suppose que client.id == utilisateur.id
    const reservations = await prisma.reservation.findMany({
      where: { code_client_id: parseInt(utilisateurId) },
      include: {
        voyage: { include: { trajet: true } },
        places: { include: { place: true } },
        paiement: true
      },
      orderBy: { date_reservation: "desc" }
    });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createReservation,
  getReservations,
  cancelReservation,
  getReservationsByClient
};