# 🚌 GARENET

> **Application de réservation de voyages en coopérative de transport** — Madagascar
> Recherche de voyage → sélection des places → paiement Mobile Money (MVola) → reçu PDF → rappels automatiques.

GARENET digitalise le parcours complet d'un client de transport interurbain : il recherche un voyage (ligne, coopérative, date), choisit ses places sur un plan de voiture, paie par **MVola** (total ou en **échéancier**), reçoit un **reçu PDF** partageable, des **rappels automatiques** avant le départ, et peut noter le voyage et la coopérative.

## 📸 Captures d'écran

| 🏠 Accueil | 🚌 Détail du voyage |
|:---:|:---:|
| <img src="screenshots/01-acceuil.png" width="100%"> | <img src="screenshots/02-detail-voyage.png" width="100%"> |
| **Accueil** : localisation auto, voyages recommandés et accès au compte | **Détail** : trajet, distance, prix, places restantes, coopérative |

| 🪑 Sélection des places | 💳 Paiement MVola |
|:---:|:---:|
| <img src="screenshots/03-plan-places.png" width="100%"> | <img src="screenshots/04-paiement-mvola.png" width="100%"> |
| **Plan de voiture** interactif — places disponibles, réservées et sélectionnées en temps réel | **Paiement Mobile Money** — « Payer tout » ou « Payer partiel » (échelonné) |

| 📋 Mes réservations | 🏢 Détail coopérative |
|:---:|:---:|
| <img src="screenshots/05-reservations.png" width="100%"> | <img src="screenshots/08-detail-cooperative.png" width="100%"> |
| **Suivi des réservations** : statut (en attente / confirmée), reste à payer | **Fiche coopérative** : note moyenne, statistiques des avis, derniers commentaires |

| ⭐ Avis & notation | 👤 Profil |
|:---:|:---:|
| <img src="screenshots/07-avis.png" width="100%"> | <img src="screenshots/06-profil.png" width="100%"> |
| **Avis** : note en étoiles + commentaire après le voyage | **Profil** : photo, rôle, thème clair/sombre, confidentialité |

---

## ✨ Fonctionnalités

### Côté client (application mobile)
- 🔐 **Inscription / Connexion** sécurisées (JWT + hachage des mots de passe)
- 🔍 **Recherche de voyages** par station de départ/arrivée, coopérative et date
- 🪑 **Sélection des places** sur le plan de la voiture (places numérotées en temps réel)
- 💳 **Paiement Mobile Money MVola** — paiement total **ou échelonné** (à la demande)
- 🧾 **Reçu de paiement PDF** généré sur l'appareil, imprimable et partageable
- ⭐ **Avis & notes** sur les voyages et les coopératives (moyenne calculée côté serveur)
- 🔔 **Notifications** : flux in-app, **push FCM** (Expo) et **rappels par e-mail**
- 📅 **Historique** complet : voyages, réservations, paiements
- 👤 **Profil** : photo, modification du profil, changement de mot de passe, **thème clair/sombre**

### Côté serveur
- 🔁 **Cron jobs** (`node-cron`) : envoi automatique d'un rappel push + e-mail à chaque client dont le voyage part dans les minutes qui suivent
- 📧 **Service e-mail** (Nodemailer/SMTP) : confirmations, reçus, relances
- 🖼️ **Upload de photos** (Multer) servies en statique (`/uploads/photos/`)
- 🧮 **Calculs monétaires** arrondis (safe float) et **traitements transactionnels** Prisma (intégrité des réservations/paiements)
- 🏢 **Gestion multi-acteurs** : administrateurs multi-coopératives (rôles client, chauffeur, responsable, admin)

---

## 🧰 Stack technique

| Couche | Technologies |
|---|---|
| **Frontend (mobile)** | React Native, **Expo SDK 54**, **expo-router** (navigation par fichiers), **TypeScript**, React Navigation 7, expo-notifications (FCM), expo-print, expo-image-picker, AsyncStorage, Axios |
| **Backend (API)** | **Node.js**, **Express 5** (ESM), **Prisma ORM**, **PostgreSQL**, JWT + bcrypt, Multer, Nodemailer, node-cron, expo-server-sdk |
| **Paiement** | **MVola** (Mobile Money — Orange Money Madagascar) — 3 modes : `SIMULATION` (dev), `SANDBOX`, `PRODUCTION` |
| **Base de données** | PostgreSQL 16, ~24 tables (voyages, trajets, stations, voitures, places, réservations, paiements, avis, notifications…) |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐          REST / JWT          ┌──────────────────────────────┐
│   APPLICATION MOBILE        │ ──────────────────────────▶  │      API EXPRESS (Node.js)   │
│   React Native + Expo       │ ◀──────────────────────────  │  routes → middlewares →      │
│   (iOS / Android / Web)     │         JSON                 │  controllers → services      │
└─────────────────────────────┘                              └──────┬──────────┬────────────┘
         ▲                                                          │          │
         │  Push FCM (expo-server-sdk)                              │          │ SMTP (Nodemailer)
         │  Rappels voyage (cron */10 min)                          │          │ E-mails de confirmation
         └──────────────────────────────────────────────────────────┤          ▼
                                                                    ▼
                                                         ┌──────────────────┐      ┌─────────────────┐
                                                         │   POSTGRESQL     │      │  API MVola      │
                                                         │  (via Prisma ORM)│      │  Mobile Money   │
                                                         └──────────────────┘      └─────────────────┘
```

### Flux principal d'une réservation

```mermaid
sequenceDiagram
    participant C as Client (App)
    participant A as API GARENET
    participant DB as PostgreSQL
    participant M as MVola
    C->>A: 1. Recherche de voyages (trajet + date)
    C->>A: 2. Sélection des places (plan de voiture)
    C->>A: 3. Création de la réservation
    C->>A: 4. Paiement MVola (total ou échelonné)
    A->>M: Demande de débit
    M-->>A: Confirmation du paiement
    A->>DB: Transaction (réservation + places + paiement)
    A-->>C: 5. Reçu PDF + notification
    Note over A,M: ⏰ Cron : rappel push + e-mail avant le départ
```

---

## 📁 Structure du projet

```
GARENET/
├── README.md
├── GARENET.sql               # Dump PostgreSQL (format custom → pg_restore)
├── GarNET.sql                # Dump PostgreSQL (texte → psql)
├── backend/
│   ├── server.js             # Point d'entrée Express + cron rappels voyage
│   ├── config/               # Prisma client, configuration Multer
│   ├── controllers/          # Logique métier par domaine (7 contrôleurs)
│   ├── middlewares/          # Authentification JWT
│   ├── routes/               # Routes API REST (7 groupes)
│   ├── services/             # E-mails, push FCM, MVola, auth
│   ├── prisma/
│   │   ├── schema.prisma     # Modèle de données (source de vérité)
│   │   └── migrations/       # Migrations SQL versionnées
│   └── uploads/              # Photos uploadées (statique)
└── frontend/
    ├── app/                  # Navigation expo-router (fichiers = écrans)
    │   ├── acceuil.tsx       # Écran d'accueil
    │   ├── se-connecter.tsx  # Connexion
    │   ├── inscription.tsx   # Inscription
    │   └── (client)/         # Espace connecté
    │       ├── home.tsx
    │       ├── voyages/      # Recherche, détail, réservation, paiement, avis
    │       ├── reservations/ # Mes réservations
    │       ├── historique/   # Historique voyages / paiements
    │       ├── notification.tsx
    │       └── profil/       # Profil, thème, aide, confidentialité
    ├── components/ui/        # Composants UI réutilisables
    ├── contexts/             # Contextes React (thème, auth…)
    └── services/             # Clients API TypeScript par domaine
```

---

## 📡 API — endpoints principaux

| Domaine | Méthode | Endpoint | Description |
|---|---|---|---|
| **Utilisateurs** | POST | `/api/utilisateurs/register` | Inscription (JWT retourné) |
| | POST | `/api/utilisateurs/login` | Connexion |
| | GET | `/api/utilisateurs/:id` | Profil |
| | PUT | `/api/utilisateurs/:id` | Mise à jour du profil (photo incluse) |
| | PUT | `/api/utilisateurs/:id/password` | Changement de mot de passe |
| | PUT | `/api/utilisateurs/:id/push-token` | Enregistrement du token FCM |
| **Voyages** | GET | `/api/voyages/search` | Recherche par station/depart/arrivée/date |
| | GET | `/api/voyages` | Liste des voyages |
| | GET | `/api/voyages/cooperative/:id` | Voyages d'une coopérative (+ filtres) |
| | GET | `/api/voyages/:id` | Détail d'un voyage |
| | GET | `/api/voyages/:id/places` | Plan des places disponibles |
| **Réservations** | POST | `/api/reservations` | Réservation avec sélection des places |
| | POST | `/api/reservations/pending` | Réservations en attente de paiement |
| | GET | `/api/reservations` / `/historique` | Mes réservations / historique |
| | PUT | `/api/reservations/:id/cancel` | Annulation |
| **Paiements** | POST | `/api/paiements` | Paiement MVola (total ou échelonné) |
| | POST | `/api/paiements/process-complete` | Finalisation d'un paiement échelonné |
| | GET | `/api/paiements` | Historique des paiements |
| **Avis** | POST | `/api/avis` | Déposer une note + commentaire |
| | GET | `/api/avis/voyage/:voyageId` | Avis d'un voyage |
| | GET | `/api/avis/cooperative/:id` | Avis d'une coopérative |
| **Coopératives** | GET | `/api/cooperatives` | Liste (+ recherche) |
| | GET | `/api/cooperatives/:id` | Détail + note moyenne |
| **Notifications** | GET/POST | `/api/notifications` | Flux de notifications |
| | GET | `/api/notifications/unread-count` | Nombre de non-lues |
| | PUT | `/api/notifications/read-all` / `/:id/read` | Marquer lu(x) |

> 📌 Toutes les routes (sauf login/register) exigent un **token JWT** valide dans l'en-tête `Authorization: Bearer <token>`.

---

## 🚀 Démarrage du projet

### Prérequis

- **Node.js ≥ 18**
- **PostgreSQL ≥ 14**
- **Expo Go** (ou Android Studio / Xcode) pour tester l'application mobile

### 1. Cloner le dépôt

```bash
git clone https://github.com/Mirado-Franck/GARENET.git
cd GARENET
```

### 2. Créer la base de données

```bash
# Créer la base vide
createdb -U postgres GARENET

# Option A : importer le dump texte (le plus simple)
psql -U postgres -d GARENET -f GarNET.sql

# Option B : importer le dump format custom
pg_restore -U postgres -d GARENET GARENET.sql
```

> 💡 Les modèles de données sont décrits dans `backend/prisma/schema.prisma`.
> Les migrations versionnées sont dans `backend/prisma/migrations/` (`npx prisma migrate deploy` pour une base vierge).

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env    # puis remplir les valeurs (voir ci-dessous)
npx prisma generate     # génère le client Prisma
npm start               # → http://localhost:3000
```

Test rapide : `curl http://localhost:3000/` devrait renvoyer `🚀 API GARENET opérationnelle`.

#### Variables d'environnement (`backend/.env`)

```ini
# ─── Serveur ───
PORT=3000

# ─── Base de données (PostgreSQL) ───
DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/GARENET?schema=public

# ─── Authentification JWT ───
JWT_SECRET=remplacez-moi-par-une-clé-secrète-longue
JWT_EXPIRES_IN=7d

# ─── E-mails (SMTP) ───
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=mot-de-passe-application
MAIL_FROM="GARENET <votre.email@gmail.com>"

# ─── MVola (Mobile Money) ───
# SIMULATION = aucun appel externe (dev local) | SANDBOX | PRODUCTION
MVOLA_MODE=SIMULATION
MVOLA_CONSUMER_KEY=
MVOLA_CONSUMER_SECRET=
MVOLA_MERCHANT_NUMBER=
MVOLA_API_URL=https://devapi.mvola.mg
MVOLA_CALLBACK_URL=http://localhost:3000/api/paiements/callback
```

> 🧪 En mode `SIMULATION`, le paiement est simulé localement : aucun compte MVola n'est nécessaire pour développer et tester le parcours complet.

### 4. Frontend (application mobile)

```bash
cd frontend
npm install
cp .env.example .env    # puis renseigner l'adresse du backend (voir ci-dessous)
npm start               # ouvre le QR code Expo Go
```

- 📱 **Sur téléphone** : scanner le QR code avec **Expo Go** (Android/iOS)
- 🖥️ **Sur navigateur** : `npm run web`

> ⚠️ **Configurer l'adresse du backend** — elle se trouve dans `frontend/.env` (jamais versionné), aucune modification de code n'est nécessaire :
>
> ```ini
> # frontend/.env
> EXPO_PUBLIC_API_URL=http://192.168.1.100:3000   # ← IP de VOTRE machine sur le Wi-Fi
> ```
>
> - 📱 **Téléphone physique** : adresse IP de votre machine (téléphone et backend sur le **même réseau Wi-Fi**)
> - 🖥️ **Navigateur** : `http://localhost:3000`
> - 🤖 **Émulateur Android** : `http://10.0.2.2:3000` (le `localhost` de l'émulateur pointe sur lui-même)
>
> Après modification de `.env`, relancez `npm start` (les variables `EXPO_PUBLIC_*` sont injectées au démarrage du bundler).

---

## 🔐 Rôles et modèle de données

Le schéma Prisma (~24 modèles) couvre l'ensemble du domaine :

- **Acteurs** : `utilisateur` (multi-rôles), `admin` (multi-coopératives via `admin_cooperative`), `responsable_cooperative`, `chauffeur`, `client` (passager)
- **Transport** : `cooperative`, `voiture`, `place_voiture` (plan numéroté), `station`, `trajet`, `station_trajet`, `voyage`
- **Vente** : `reservation`, `reservation_place`, `paiement` (échéancier), `recu`
- **Expérience client** : `avis` (note + commentaire), `notification` (+ push token), `document`

La gestion des places repose sur des uniques (`@@unique([voiture_id, numero])`, `@@unique([reservation_id, place_id])`) : **une place ne peut être vendue qu'une seule fois**, et les réservations/paiements s'exécutent dans des **transactions Prisma**.

---

## 🗺️ Roadmap

- [ ] Suite de tests (Jest / Supertest) sur les routes critiques (réservation, paiement)
- [ ] Conteneurisation Docker (API + PostgreSQL) et déploiement cloud
- [ ] Espace **web de gestion** pour les coopératives (création de voyages, suivi des recettes)
- [ ] Mode `SANDBOX`/`PRODUCTION` MVola en production avec webhook signé
- [ ] Tableau de bord statistique (trajets les plus demandés, taux d'occupation, CA)

---

## 📄 Licence

[MIT](./LICENSE) — libre de consultation et de réutilisation à but pédagogique.

---

## 👤 Auteur

**Mirado Franck** — [GitHub](https://github.com/Mirado-Franck)

*© 2024–2026 GARENET. Tous droits réservés.*
