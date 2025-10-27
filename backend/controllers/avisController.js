import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createAvis = async (req, res, next) => {
  try {
    const { note, commentaire, voyageId } = req.body;
    const avis = await prisma.avis.create({
      data: {
        idAvis: `AVIS${Date.now()}`,
        note,
        commentaire,
        dateAvis: new Date(),
        voyageId,
        clientId: 1 // Valeur temporaire pour tester sans authentification
      }
    });
    res.status(201).json(avis);
  } catch (err) {
    next(err);
  }
};

const getAvisByVoyage = async (req, res, next) => {
  try {
    const avis = await prisma.avis.findMany({
      where: { voyageId: parseInt(req.params.voyageId) },
      include: { client: true }
    });
    res.json(avis);
  } catch (err) {
    next(err);
  }
};

export { createAvis, getAvisByVoyage };