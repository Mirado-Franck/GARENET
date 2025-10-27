// services/authService.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const register = async (data) => {
  const {
    nom,
    prenoms,           // ← ton champ
    email,
    motDePasse,
    telephone,
    role = "client",
    photoIdentiter = "",
    statutCompte = "actif"
  } = data;

  // Vérifier email
  const existingUser = await prisma.utilisateur.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error("Cet email est déjà utilisé");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(motDePasse, 10);
  const idUtilisateur = `USER${Date.now()}`;

  // NE PAS PASSER `id` → Prisma le gère
  const utilisateur = await prisma.utilisateur.create({
    data: {
      idUtilisateur,
      nom,
      prenoms,
      email,
      telephone: parseInt(telephone),
      statutCompte,
      role,
      dateCreationCompte: new Date(),
      motDePasse: hashedPassword,
      photoIdentiter
    }
  });

  const { motDePasse: _, ...userWithoutPassword } = utilisateur;
  return userWithoutPassword;
};