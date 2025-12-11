// backend/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron"; // 👈 NOUVEAU
import { PrismaClient } from "./generated/prisma/index.js"; // 👈 NOUVEAU
import { sendVoyageReminder } from "./services/pushNotificationService.js"; // 👈 NOUVEAU

// Import des routes
import utilisateurRoutes from "./routes/utilisateurRoutes.js";
import paiementRoutes from "./routes/paiementRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import avisRoutes from "./routes/avisRoutes.js";
import voyageRoutes from "./routes/voyageRoutes.js";
import cooperativeRoutes from "./routes/cooperativeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// ✅ Configuration pour __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma client pour le cron job
const prisma = new PrismaClient();

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
app.use("/api/notifications", notificationRoutes);

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

// ========================================
// ⏰ CRON JOB - RAPPELS DE VOYAGE (TEST)
// ========================================

/**
 * Cron job qui s'exécute toutes les minutes.
 * Il cherche les voyages dont le départ est dans 2 à 7 minutes
 * et déclenche sendVoyageReminder(voyage.id).
 */
const setupVoyageReminderCron = () => {
  // Exécuter toutes les 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('\n⏰ ===== CRON: Vérification rappels voyage =====');
    console.log(`📅 Date/Heure: ${new Date().toLocaleString('fr-FR')}`);

    try {
      const now = new Date();

      // Fenêtre réelle : voyages qui partent dans ~2h
      // On prend une marge : entre 2h00 et 2h20 à partir de "now"
      const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);        // + 2h00
      const maxTime = new Date(now.getTime() + (2 * 60 + 20) * 60 * 1000); // + 2h20

      console.log(`🔍 Recherche voyages entre ${minTime.toLocaleTimeString('fr-FR')} et ${maxTime.toLocaleTimeString('fr-FR')}`);

      const voyages = await prisma.voyage.findMany({
        where: {
          status: 'disponible',
          date_depart: {
            gte: minTime,
            lte: maxTime,
          },
        },
        include: {
          trajet: true,
        },
        orderBy: { date_depart: 'asc' },
      });

      console.log(`📋 ${voyages.length} voyage(s) trouvé(s) pour rappel`);

      for (const voyage of voyages) {
        console.log(`🚌 Voyage ${voyage.code_voyage} (${voyage.trajet.station_depart} → ${voyage.trajet.station_arrivee})`);
        await sendVoyageReminder(voyage.id);
      }

      console.log('✅ Fin du cycle de rappel\n');
    } catch (error) {
      console.error('❌ Erreur cron rappels voyage:', error);
    }
  });

  console.log('⏰ Cron job rappels voyage initialisé (toutes les 10 minutes)');
};

// ========================================
// ✅ GESTION DES ERREURS
// ========================================

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// ========================================
// 🚀 DÉMARRAGE DU SERVEUR
// ========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info(`\n✅ Serveur démarré sur http://localhost:${PORT}/`);
  console.info(`📁 Photos accessibles via http://localhost:${PORT}/uploads/photos/`);
  console.info(`📡 API disponible sur http://localhost:${PORT}/api/`);
  
  // 🔥 Initialiser le cron job pour les rappels
  setupVoyageReminderCron();
  
  console.info(`\n🚀 Serveur prêt !\n`);
});

export default app;