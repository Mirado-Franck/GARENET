
// Importation des modules express et cors 
import express from "express";
import cors from "cors";
//import visiteurRoute from "./routes/visiteurRoute.js"; // 🟢 Import avec extension .js
import utilisateurRoutes from "./routes/utilisateurRoutes.js";
import paiementRoutes from "./routes/paiementRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import avisRoutes from "./routes/avisRoutes.js";
import voyageRoutes from "./routes/voyageRoutes.js";
import cooperativeRoutes from "./routes/cooperativeRoutes.js";
// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Utilisation de la route
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/voyages", voyageRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/avis", avisRoutes);
app.use("/api/cooperatives", cooperativeRoutes);

// Démarrage de l'application
const PORT = 3000;
app.listen(PORT, () => {
  console.info(`✅ Application démarrée sur http://localhost:${PORT}/`);
});
