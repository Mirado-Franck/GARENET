import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getVoyages = async (req, res, next) => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: { trajets: true, voiture: true, chauffeurs: true }
    });
    res.json(voyages);
  } catch (err) {
    next(err);
  }
};

const createVoyage = async (req, res, next) => {
  try {
    const { dateDepart, heureDepart, prix, cooperativeId, voitureId, chauffeurIds, trajetIds } = req.body;
    const voyage = await prisma.voyage.create({
      data: {
        idVoyage: `VOY${Date.now()}`,
        dateDepart,
        heureDepart,
        prix,
        statut: "planifie",
        tauxRemplissage: 0,
        cooperativeId,
        voitureId,
        chauffeurs: { connect: chauffeurIds.map(id => ({ id })) },
        trajets: { connect: trajetIds.map(id => ({ id })) }
      }
    });
    res.status(201).json(voyage);
  } catch (err) {
    next(err);
  }
};

export { getVoyages, createVoyage };