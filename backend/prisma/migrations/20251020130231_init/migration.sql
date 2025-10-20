-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "idUtilisateur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenoms" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telephone" INTEGER NOT NULL,
    "statutCompte" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "dateCreationCompte" TIMESTAMP NOT NULL,
    "motDePasse" VARCHAR(100) NOT NULL,
    "photoIdentiter" TEXT NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "idUtilisateur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenoms" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telephone" INTEGER NOT NULL,
    "statutCompte" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "dateCreationCompte" TIMESTAMP NOT NULL,
    "motDePasse" VARCHAR(100) NOT NULL,
    "photoIdentiter" TEXT NOT NULL,
    "matriculeAdmin" VARCHAR(25) NOT NULL,
    "dernierAcces" TIMESTAMP NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "idUtilisateur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenoms" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telephone" INTEGER NOT NULL,
    "statutCompte" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "dateCreationCompte" TIMESTAMP NOT NULL,
    "motDePasse" VARCHAR(100) NOT NULL,
    "photoIdentiter" TEXT NOT NULL,
    "idClient" VARCHAR(25) NOT NULL,
    "adresse" VARCHAR(100) NOT NULL,
    "moyenneSatisfaction" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsableCooperative" (
    "id" SERIAL NOT NULL,
    "idUtilisateur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenoms" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telephone" INTEGER NOT NULL,
    "statutCompte" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "dateCreationCompte" TIMESTAMP NOT NULL,
    "motDePasse" VARCHAR(100) NOT NULL,
    "photoIdentiter" TEXT NOT NULL,
    "idResponsable" VARCHAR(25) NOT NULL,
    "nomCooperative" VARCHAR(20) NOT NULL,
    "adresseCooperative" VARCHAR(100) NOT NULL,
    "statutCooperative" VARCHAR(20) NOT NULL,
    "cooperativeId" INTEGER NOT NULL,

    CONSTRAINT "ResponsableCooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" SERIAL NOT NULL,
    "idAvis" VARCHAR(25) NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "commentaire" TEXT NOT NULL,
    "dateAvis" TIMESTAMP NOT NULL,
    "voyageId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" SERIAL NOT NULL,
    "idChauffeur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "permis" VARCHAR(100) NOT NULL,
    "dateExpirationPermis" DATE NOT NULL,
    "disponibilite" BOOLEAN NOT NULL,
    "affectationsActuelle" VARCHAR(100) NOT NULL,
    "voyageId" INTEGER,
    "voitureId" INTEGER,

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" SERIAL NOT NULL,
    "idCooperative" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "adresse" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(100) NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "dateInscription" TIMESTAMP NOT NULL,
    "adminId" INTEGER,

    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "idDocument" VARCHAR(25) NOT NULL,
    "typeDocument" VARCHAR(50) NOT NULL,
    "dateExpiration" DATE NOT NULL,
    "fichier" VARCHAR(50) NOT NULL,
    "etat" VARCHAR(20) NOT NULL,
    "voitureId" INTEGER NOT NULL,
    "chauffeurId" INTEGER,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "idNotification" VARCHAR(25) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "canal" VARCHAR(20) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" SERIAL NOT NULL,
    "idPaiement" VARCHAR(25) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "modePaiement" VARCHAR(20) NOT NULL,
    "datePaiement" TIMESTAMP NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "reservationId" INTEGER,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passager" (
    "id" SERIAL NOT NULL,
    "idPassager" VARCHAR(25) NOT NULL,
    "dateNaissance" DATE NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "numeroCIN" INTEGER NOT NULL,
    "telephone" INTEGER NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "voyageId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Passager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recu" (
    "id" SERIAL NOT NULL,
    "idRecu" VARCHAR(25) NOT NULL,
    "dateEmission" DATE NOT NULL,
    "montantTotal" INTEGER NOT NULL,
    "qrCode" VARCHAR(50) NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "reservationId" INTEGER,

    CONSTRAINT "Recu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "idReservation" VARCHAR(25) NOT NULL,
    "dateReservation" TIMESTAMP NOT NULL,
    "statut" VARCHAR(20) NOT NULL,
    "nombrePlaces" INTEGER NOT NULL,
    "modePaiement" VARCHAR(20) NOT NULL,
    "codeQR" VARCHAR(50) NOT NULL,
    "numeroPlace" INTEGER NOT NULL,
    "trajetId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "idStation" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "localisation" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "cooperativeId" INTEGER NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trajet" (
    "id" SERIAL NOT NULL,
    "codeTrajet" VARCHAR(25) NOT NULL,
    "stationDepart" VARCHAR(50) NOT NULL,
    "stationArrivee" VARCHAR(50) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "statut" VARCHAR(20) NOT NULL,

    CONSTRAINT "Trajet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voiture" (
    "id" SERIAL NOT NULL,
    "idVoiture" VARCHAR(25) NOT NULL,
    "immatriculation" VARCHAR(20) NOT NULL,
    "modele" VARCHAR(25) NOT NULL,
    "capacite" INTEGER NOT NULL,
    "disponibilite" BOOLEAN NOT NULL,
    "etatTechnique" VARCHAR(20) NOT NULL,
    "nbRanger" INTEGER NOT NULL,
    "nbPlaceParRanger" INTEGER NOT NULL,
    "voyageId" INTEGER,
    "cooperativeId" INTEGER NOT NULL,

    CONSTRAINT "Voiture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voyage" (
    "id" SERIAL NOT NULL,
    "idVoyage" VARCHAR(25) NOT NULL,
    "dateDepart" TIMESTAMP NOT NULL,
    "heureDepart" TIMESTAMP NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "statut" VARCHAR(25) NOT NULL,
    "tauxRemplissage" DOUBLE PRECISION NOT NULL,
    "cooperativeId" INTEGER NOT NULL,

    CONSTRAINT "Voyage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecevoirClient" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecevoirClient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Recevoir" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Recevoir_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Envoyer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Envoyer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TrajetsSupplementaires" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TrajetsSupplementaires_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Affecte" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Affecte_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Relie" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Relie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TrajetVoyage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TrajetVoyage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_idUtilisateur_key" ON "Utilisateur"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_idUtilisateur_key" ON "Admin"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Client_idUtilisateur_key" ON "Client"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Client_idClient_key" ON "Client"("idClient");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsableCooperative_idUtilisateur_key" ON "ResponsableCooperative"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsableCooperative_idResponsable_key" ON "ResponsableCooperative"("idResponsable");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_idAvis_key" ON "Avis"("idAvis");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_clientId_key" ON "Avis"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_idChauffeur_key" ON "Chauffeur"("idChauffeur");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_idCooperative_key" ON "Cooperative"("idCooperative");

-- CreateIndex
CREATE UNIQUE INDEX "Document_idDocument_key" ON "Document"("idDocument");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_idNotification_key" ON "Notification"("idNotification");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_idPaiement_key" ON "Paiement"("idPaiement");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_reservationId_key" ON "Paiement"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Passager_idPassager_key" ON "Passager"("idPassager");

-- CreateIndex
CREATE UNIQUE INDEX "Recu_idRecu_key" ON "Recu"("idRecu");

-- CreateIndex
CREATE UNIQUE INDEX "Recu_reservationId_key" ON "Recu"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_idReservation_key" ON "Reservation"("idReservation");

-- CreateIndex
CREATE UNIQUE INDEX "Station_idStation_key" ON "Station"("idStation");

-- CreateIndex
CREATE UNIQUE INDEX "Trajet_codeTrajet_key" ON "Trajet"("codeTrajet");

-- CreateIndex
CREATE UNIQUE INDEX "Voiture_idVoiture_key" ON "Voiture"("idVoiture");

-- CreateIndex
CREATE UNIQUE INDEX "Voiture_voyageId_key" ON "Voiture"("voyageId");

-- CreateIndex
CREATE UNIQUE INDEX "Voyage_idVoyage_key" ON "Voyage"("idVoyage");

-- CreateIndex
CREATE INDEX "_RecevoirClient_B_index" ON "_RecevoirClient"("B");

-- CreateIndex
CREATE INDEX "_Recevoir_B_index" ON "_Recevoir"("B");

-- CreateIndex
CREATE INDEX "_Envoyer_B_index" ON "_Envoyer"("B");

-- CreateIndex
CREATE INDEX "_TrajetsSupplementaires_B_index" ON "_TrajetsSupplementaires"("B");

-- CreateIndex
CREATE INDEX "_Affecte_B_index" ON "_Affecte"("B");

-- CreateIndex
CREATE INDEX "_Relie_B_index" ON "_Relie"("B");

-- CreateIndex
CREATE INDEX "_TrajetVoyage_B_index" ON "_TrajetVoyage"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsableCooperative" ADD CONSTRAINT "ResponsableCooperative_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsableCooperative" ADD CONSTRAINT "ResponsableCooperative_id_fkey" FOREIGN KEY ("id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_voitureId_fkey" FOREIGN KEY ("voitureId") REFERENCES "Voiture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_voitureId_fkey" FOREIGN KEY ("voitureId") REFERENCES "Voiture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passager" ADD CONSTRAINT "Passager_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passager" ADD CONSTRAINT "Passager_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recu" ADD CONSTRAINT "Recu_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_trajetId_fkey" FOREIGN KEY ("trajetId") REFERENCES "Trajet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "ResponsableCooperative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voiture" ADD CONSTRAINT "Voiture_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voiture" ADD CONSTRAINT "Voiture_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voyage" ADD CONSTRAINT "Voyage_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecevoirClient" ADD CONSTRAINT "_RecevoirClient_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecevoirClient" ADD CONSTRAINT "_RecevoirClient_B_fkey" FOREIGN KEY ("B") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Recevoir" ADD CONSTRAINT "_Recevoir_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Recevoir" ADD CONSTRAINT "_Recevoir_B_fkey" FOREIGN KEY ("B") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Envoyer" ADD CONSTRAINT "_Envoyer_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Envoyer" ADD CONSTRAINT "_Envoyer_B_fkey" FOREIGN KEY ("B") REFERENCES "ResponsableCooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrajetsSupplementaires" ADD CONSTRAINT "_TrajetsSupplementaires_A_fkey" FOREIGN KEY ("A") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrajetsSupplementaires" ADD CONSTRAINT "_TrajetsSupplementaires_B_fkey" FOREIGN KEY ("B") REFERENCES "Trajet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Affecte" ADD CONSTRAINT "_Affecte_A_fkey" FOREIGN KEY ("A") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Affecte" ADD CONSTRAINT "_Affecte_B_fkey" FOREIGN KEY ("B") REFERENCES "Voiture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Relie" ADD CONSTRAINT "_Relie_A_fkey" FOREIGN KEY ("A") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Relie" ADD CONSTRAINT "_Relie_B_fkey" FOREIGN KEY ("B") REFERENCES "Trajet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrajetVoyage" ADD CONSTRAINT "_TrajetVoyage_A_fkey" FOREIGN KEY ("A") REFERENCES "Trajet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrajetVoyage" ADD CONSTRAINT "_TrajetVoyage_B_fkey" FOREIGN KEY ("B") REFERENCES "Voyage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
