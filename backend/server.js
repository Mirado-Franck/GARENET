// backend/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import des routes
import utilisateurRoutes from "./routes/utilisateurRoutes.js";
import paiementRoutes from "./routes/paiementRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import avisRoutes from "./routes/avisRoutes.js";
import voyageRoutes from "./routes/voyageRoutes.js";
import cooperativeRoutes from "./routes/cooperativeRoutes.js";

// ✅ Configuration pour __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ SERVIR LES FICHIERS STATIQUES (photos uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/voyages", voyageRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/avis", avisRoutes);
app.use("/api/cooperatives", cooperativeRoutes);

// ✅ Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API GARENET opérationnelle',
    version: '1.0.0',
    endpoints: {
      utilisateurs: '/api/utilisateurs',
      voyages: '/api/voyages',
      reservations: '/api/reservations',
      paiements: '/api/paiements',
      avis: '/api/avis',
      cooperatives: '/api/cooperatives',
      uploads: '/uploads/photos/'
    }
  });
});

// ✅ Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// ✅ Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info(`✅ Serveur démarré sur http://localhost:${PORT}/`);
  console.info(`📁 Photos accessibles via http://localhost:${PORT}/uploads/photos/`);
  console.info(`📡 API disponible sur http://localhost:${PORT}/api/`);
});

export default app;