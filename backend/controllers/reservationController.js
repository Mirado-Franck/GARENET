import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// === CRÉATION D'UNE RÉSERVATION ===
const createReservation = async (req, res, next) => {
  try {
    const {
      code_trajet_id,
      code_voyage_id,
      code_client_id,
      nombre_places,
      places, // Tableau de numéros de place: ["A1", "B3", "C2"]
      mode_paiement
    } = req.body;

    // === VALIDATION ===
    if (!code_trajet_id || !code_voyage_id || !code_client_id || !nombre_places || !Array.isArray(places)) {
      return res.status(400).json({ error: "Données manquantes ou invalides" });
    }

    if (places.length !== nombre_places) {
      return res.status(400).json({ error: "Le nombre de places ne correspond pas à la liste fournie" });
    }

    // === VÉRIFIER QUE LE VOYAGE EXISTE ===
    const voyage = await prisma.voyage.findUnique({
      where: { id: code_voyage_id },
      include: { voiture: { include: { places: true } } }
    });

    if (!voyage) {
      return res.status(404).json({ error: "Voyage non trouvé" });
    }

    // === VÉRIFIER LES PLACES DISPONIBLES ===
    const voiturePlaces = voyage.voiture.places;
    const placeMap = new Map(voiturePlaces.map(p => [p.numero, p]));

    const invalidPlaces = [];
    const reservedPlaces = [];

    for (const numero of places) {
      const place = placeMap.get(numero);
      if (!place) {
        invalidPlaces.push(numero);
      } else if (place.est_chauffeur) {
        invalidPlaces.push(`${numero} (siège chauffeur)`);
      } else if (place.est_reserve) {
        reservedPlaces.push(numero);
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

    // === CRÉER LA RÉSERVATION ===
    const code_reservation = `RES${Date.now()}${Math.floor(Math.random() * 100)}`;

    const reservation = await prisma.reservation.create({
      data: {
        code_trajet_id,
        code_voyage_id,
        code_client_id,
        code_reservation,
        date_reservation: new Date(),
        statut: "en_attente",
        nombre_places,
        mode_paiement,
        // Créer les liens avec les places
        places: {
          create: places.map(numero => ({
            place: { connect: { voiture_id_numero: { voiture_id: voyage.code_voiture_id, numero } } }
          }))
        }
      },
      include: {
        places: { include: { place: true } },
        voyage: true,
        client: true
      }
    });

    // === MARQUER LES PLACES COMME RÉSERVÉES ===
    await prisma.place_voiture.updateMany({
      where: {
        voiture_id: voyage.code_voiture_id,
        numero: { in: places }
      },
      data: { est_reserve: true }
    });

    res.status(201).json({
      message: "Réservation créée avec succès",
      reservation
    });
  } catch (err) {
    console.error("Erreur création réservation:", err);
    next(err);
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