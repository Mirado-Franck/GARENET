import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Exemple de route test
app.get("/", (req, res) => {
  res.send("Serveur backend connecté 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur le port ${PORT}`));
