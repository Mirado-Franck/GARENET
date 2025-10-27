import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createPaiement = async (req, res, next) => {
  try {
    const { montant, modePaiement, reservationId } = req.body;
    const paiement = await prisma.paiement.create({
      data: {
        idPaiement: `PAY${Date.now()}`,
        montant,
        modePaiement,
        datePaiement: new Date(),
        statut: "valide",
        reservationId
      }
    });
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { statut: "confirmee" }
    });
    res.status(201).json(paiement);
  } catch (err) {
    next(err);
  }
};

const getPaiements = async (req, res, next) => {
  try {
    const paiements = await prisma.paiement.findMany({
      where: { reservation: { clientId: 1 } }, // Valeur temporaire pour tester sans authentification
      include: { reservation: true }
    });
    res.json(paiements);
  } catch (err) {
    next(err);
  }
};

export { createPaiement, getPaiements };