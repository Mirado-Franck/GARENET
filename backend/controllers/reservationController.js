import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createReservation = async (req, res, next) => {
  try {
    const { trajetId, nombrePlaces, modePaiement, numeroPlace } = req.body;
    const reservation = await prisma.reservation.create({
      data: {
        idReservation: `RES${Date.now()}`,
        dateReservation: new Date(),
        statut: "en_attente",
        nombrePlaces,
        modePaiement,
        codeQR: `QR${Date.now()}`,
        numeroPlace,
        trajetId,
        clientId: 1, // Valeur temporaire pour tester sans authentification
        voyageId: trajetId // Supposons que trajetId est aussi voyageId pour simplifier
      }
    });
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};

const getReservations = async (req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { clientId: 1 }, // Valeur temporaire pour tester sans authentification
      include: { trajet: true, paiement: true, recu: true }
    });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(req.params.id) },
      data: { statut: "annulee" }
    });
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

export { createReservation, getReservations, cancelReservation };