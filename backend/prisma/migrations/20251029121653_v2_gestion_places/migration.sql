-- CreateTable
CREATE TABLE "place_voiture" (
    "id" SERIAL NOT NULL,
    "voiture_id" INTEGER NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "est_chauffeur" BOOLEAN NOT NULL DEFAULT false,
    "est_reserve" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "place_voiture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_place" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "place_id" INTEGER NOT NULL,

    CONSTRAINT "reservation_place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" INTEGER NOT NULL,
    "matricule_admin" VARCHAR(25) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_cooperative" (
    "admin_id" INTEGER NOT NULL,
    "cooperative_id" INTEGER NOT NULL,

    CONSTRAINT "admin_cooperative_pkey" PRIMARY KEY ("admin_id","cooperative_id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" SERIAL NOT NULL,
    "code_voyage_id" INTEGER,
    "code_client_id" INTEGER NOT NULL,
    "ref_avis" VARCHAR(25) NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "commentaire" TEXT,
    "date_avis" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chauffeur" (
    "id" SERIAL NOT NULL,
    "code_chauffeur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "permis" VARCHAR(70) NOT NULL,
    "date_expiration_permis" DATE,
    "disponibilite" VARCHAR(255) NOT NULL,
    "affectation_actuelle" VARCHAR(100),
    "telephone" INTEGER NOT NULL,
    "cin" VARCHAR(12) NOT NULL,
    "adress" VARCHAR(70),
    "etat_visite_med" BOOLEAN,

    CONSTRAINT "chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" INTEGER NOT NULL,
    "ref_responsable_id" INTEGER,
    "ref_client" VARCHAR(25) NOT NULL,
    "adresse" VARCHAR(100),
    "moyenne_satisfaction" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooperative" (
    "id" SERIAL NOT NULL,
    "code_cooperative" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "adresse" VARCHAR(100),
    "contact" VARCHAR(100),
    "statut" VARCHAR(255) NOT NULL,
    "date_inscription" TIMESTAMP(0) NOT NULL,
    "logo" VARCHAR(100),

    CONSTRAINT "cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctrine_migration_versions" (
    "version" VARCHAR(191) NOT NULL,
    "executed_at" TIMESTAMP(0),
    "execution_time" INTEGER,

    CONSTRAINT "doctrine_migration_versions_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "document" (
    "id" SERIAL NOT NULL,
    "code_voiture_id" INTEGER,
    "code_document" VARCHAR(25) NOT NULL,
    "type_document" VARCHAR(255) NOT NULL,
    "date_expiration" DATE NOT NULL,
    "fichier" VARCHAR(100),
    "etat" VARCHAR(255) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "ref_utilisateur_id" INTEGER,
    "ref_notification" VARCHAR(70) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(0) NOT NULL,
    "statut" VARCHAR(255) NOT NULL,
    "canal" VARCHAR(255) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" SERIAL NOT NULL,
    "code_reservation_id" INTEGER NOT NULL,
    "code_paiement" VARCHAR(25) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "mode_paiement" VARCHAR(255) NOT NULL,
    "date_paiement" TIMESTAMP(0) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "paiement_restant" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passager" (
    "id" SERIAL NOT NULL,
    "code_voyage_id" INTEGER NOT NULL,
    "code_client_id" INTEGER,
    "code_passager" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(40) NOT NULL,
    "prenoms" VARCHAR(60) NOT NULL,
    "date_naissance" DATE,
    "numero_cin" INTEGER,
    "telephone" INTEGER NOT NULL,
    "email" VARCHAR(60),

    CONSTRAINT "passager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recu" (
    "id" SERIAL NOT NULL,
    "code_reservation_id" INTEGER NOT NULL,
    "code_recu" VARCHAR(25) NOT NULL,
    "date_emission" TIMESTAMP(0) NOT NULL,
    "qr_code" VARCHAR(50) NOT NULL,
    "format" VARCHAR(25),

    CONSTRAINT "recu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "code_trajet_id" INTEGER NOT NULL,
    "code_voyage_id" INTEGER NOT NULL,
    "code_client_id" INTEGER NOT NULL,
    "code_responsable_id" INTEGER,
    "code_reservation" VARCHAR(25) NOT NULL,
    "date_reservation" TIMESTAMP(0) NOT NULL,
    "statut" VARCHAR(255) NOT NULL,
    "nombre_places" INTEGER NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsable_cooperative" (
    "id" INTEGER NOT NULL,
    "code_cooperative_id" INTEGER NOT NULL,
    "ref_responsable" VARCHAR(25) NOT NULL,
    "nom_cooperative" VARCHAR(70) NOT NULL,
    "adresse_cooperative" VARCHAR(100),
    "statut_cooperative" VARCHAR(30) NOT NULL,

    CONSTRAINT "responsable_cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station" (
    "id" SERIAL NOT NULL,
    "code_cooperative_id" INTEGER NOT NULL,
    "code_station" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "localisation" VARCHAR(100) NOT NULL,
    "capacite" INTEGER,
    "responsable" VARCHAR(70) NOT NULL,
    "statut" VARCHAR(255) NOT NULL,
    "coordonnee" INTEGER NOT NULL,

    CONSTRAINT "station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station_trajet" (
    "station_id" INTEGER NOT NULL,
    "trajet_id" INTEGER NOT NULL,

    CONSTRAINT "station_trajet_pkey" PRIMARY KEY ("station_id","trajet_id")
);

-- CreateTable
CREATE TABLE "trajet" (
    "id" SERIAL NOT NULL,
    "code_trajet" VARCHAR(25) NOT NULL,
    "station_depart" VARCHAR(50) NOT NULL,
    "station_arrivee" VARCHAR(50) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(255) NOT NULL,

    CONSTRAINT "trajet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "ref_utilisateur" VARCHAR(25) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenoms" VARCHAR(70),
    "email" VARCHAR(100),
    "telephone" TEXT NOT NULL,
    "statut_compte" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "date_creation_compte" TIMESTAMP(0) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "photo_identite" TEXT,
    "type_utilisateur" VARCHAR(255) NOT NULL,
    "dernier_acces" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voiture" (
    "id" SERIAL NOT NULL,
    "code_station_id" INTEGER,
    "code_cooperative_id" INTEGER NOT NULL,
    "immatriculation" VARCHAR(20) NOT NULL,
    "modele" VARCHAR(25) NOT NULL,
    "capacite" INTEGER NOT NULL,
    "disponibilite" VARCHAR(25) NOT NULL,
    "etat_technique" VARCHAR(20) NOT NULL,
    "nb_ranger" INTEGER NOT NULL,
    "nb_place_par_ranger" INTEGER NOT NULL,

    CONSTRAINT "voiture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voiture_chauffeur" (
    "voiture_id" INTEGER NOT NULL,
    "chauffeur_id" INTEGER NOT NULL,

    CONSTRAINT "voiture_chauffeur_pkey" PRIMARY KEY ("voiture_id","chauffeur_id")
);

-- CreateTable
CREATE TABLE "voyage" (
    "id" SERIAL NOT NULL,
    "code_trajet_id" INTEGER NOT NULL,
    "code_cooperative_id" INTEGER NOT NULL,
    "code_voiture_id" INTEGER NOT NULL,
    "code_chauffeur_id" INTEGER NOT NULL,
    "code_voyage" VARCHAR(25) NOT NULL,
    "date_depart" TIMESTAMP(0) NOT NULL,
    "heure_depart" TIMESTAMP(0),
    "prix" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(255) NOT NULL,

    CONSTRAINT "voyage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "place_voiture_voiture_id_idx" ON "place_voiture"("voiture_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_voiture_voiture_id_numero_key" ON "place_voiture"("voiture_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_place_reservation_id_place_id_key" ON "reservation_place"("reservation_id", "place_id");

-- CreateIndex
CREATE INDEX "idx_ec1d9572642b8210" ON "admin_cooperative"("admin_id");

-- CreateIndex
CREATE INDEX "idx_ec1d95728d0c5d40" ON "admin_cooperative"("cooperative_id");

-- CreateIndex
CREATE INDEX "idx_8f91abf0b5ae1119" ON "avis"("code_client_id");

-- CreateIndex
CREATE INDEX "idx_8f91abf0c48c9d97" ON "avis"("code_voyage_id");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_5ca777b8abe530da" ON "chauffeur"("cin");

-- CreateIndex
CREATE INDEX "idx_c74404551e53ac7d" ON "client"("ref_responsable_id");

-- CreateIndex
CREATE INDEX "idx_d8698a76292f555c" ON "document"("code_voiture_id");

-- CreateIndex
CREATE INDEX "idx_bf5476cab61ed040" ON "notification"("ref_utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_b1dc7a1ef30b501d" ON "paiement"("code_reservation_id");

-- CreateIndex
CREATE INDEX "idx_bff42ee9b5ae1119" ON "passager"("code_client_id");

-- CreateIndex
CREATE INDEX "idx_bff42ee9c48c9d97" ON "passager"("code_voyage_id");

-- CreateIndex
CREATE INDEX "idx_c0d10317f30b501d" ON "recu"("code_reservation_id");

-- CreateIndex
CREATE INDEX "idx_42c8495518fc5a88" ON "reservation"("code_responsable_id");

-- CreateIndex
CREATE INDEX "idx_42c84955a157d01b" ON "reservation"("code_trajet_id");

-- CreateIndex
CREATE INDEX "idx_42c84955b5ae1119" ON "reservation"("code_client_id");

-- CreateIndex
CREATE INDEX "idx_42c84955c48c9d97" ON "reservation"("code_voyage_id");

-- CreateIndex
CREATE INDEX "idx_71f3f588c6359aba" ON "responsable_cooperative"("code_cooperative_id");

-- CreateIndex
CREATE INDEX "idx_9f39f8b1c6359aba" ON "station"("code_cooperative_id");

-- CreateIndex
CREATE INDEX "idx_e4b9ba6a21bdb235" ON "station_trajet"("station_id");

-- CreateIndex
CREATE INDEX "idx_e4b9ba6ad12a823" ON "station_trajet"("trajet_id");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_1d1c63b3e7927c74" ON "utilisateur"("email");

-- CreateIndex
CREATE INDEX "utilisateur_email_idx" ON "utilisateur"("email");

-- CreateIndex
CREATE INDEX "idx_e9e2810f9134fd3" ON "voiture"("code_station_id");

-- CreateIndex
CREATE INDEX "idx_e9e2810fc6359aba" ON "voiture"("code_cooperative_id");

-- CreateIndex
CREATE INDEX "idx_c6d358fc181a8ba" ON "voiture_chauffeur"("voiture_id");

-- CreateIndex
CREATE INDEX "idx_c6d358fc85c0b3be" ON "voiture_chauffeur"("chauffeur_id");

-- CreateIndex
CREATE INDEX "idx_3f9d8955292f555c" ON "voyage"("code_voiture_id");

-- CreateIndex
CREATE INDEX "idx_3f9d89554ee841db" ON "voyage"("code_chauffeur_id");

-- CreateIndex
CREATE INDEX "idx_3f9d8955a157d01b" ON "voyage"("code_trajet_id");

-- CreateIndex
CREATE INDEX "idx_3f9d8955c6359aba" ON "voyage"("code_cooperative_id");

-- AddForeignKey
ALTER TABLE "place_voiture" ADD CONSTRAINT "place_voiture_voiture_id_fkey" FOREIGN KEY ("voiture_id") REFERENCES "voiture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_place" ADD CONSTRAINT "reservation_place_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_place" ADD CONSTRAINT "reservation_place_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place_voiture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "fk_880e0d76bf396750" FOREIGN KEY ("id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_cooperative" ADD CONSTRAINT "fk_ec1d9572642b8210" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_cooperative" ADD CONSTRAINT "fk_ec1d95728d0c5d40" FOREIGN KEY ("cooperative_id") REFERENCES "cooperative"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "fk_8f91abf0b5ae1119" FOREIGN KEY ("code_client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "fk_8f91abf0c48c9d97" FOREIGN KEY ("code_voyage_id") REFERENCES "voyage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "fk_c74404551e53ac7d" FOREIGN KEY ("ref_responsable_id") REFERENCES "responsable_cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "fk_c7440455bf396750" FOREIGN KEY ("id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "fk_d8698a76292f555c" FOREIGN KEY ("code_voiture_id") REFERENCES "voiture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "fk_bf5476cab61ed040" FOREIGN KEY ("ref_utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "fk_b1dc7a1ef30b501d" FOREIGN KEY ("code_reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "passager" ADD CONSTRAINT "fk_bff42ee9b5ae1119" FOREIGN KEY ("code_client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "passager" ADD CONSTRAINT "fk_bff42ee9c48c9d97" FOREIGN KEY ("code_voyage_id") REFERENCES "voyage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recu" ADD CONSTRAINT "fk_c0d10317f30b501d" FOREIGN KEY ("code_reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "fk_42c8495518fc5a88" FOREIGN KEY ("code_responsable_id") REFERENCES "responsable_cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "fk_42c84955a157d01b" FOREIGN KEY ("code_trajet_id") REFERENCES "trajet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "fk_42c84955b5ae1119" FOREIGN KEY ("code_client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "fk_42c84955c48c9d97" FOREIGN KEY ("code_voyage_id") REFERENCES "voyage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "responsable_cooperative" ADD CONSTRAINT "fk_71f3f588bf396750" FOREIGN KEY ("id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "responsable_cooperative" ADD CONSTRAINT "fk_71f3f588c6359aba" FOREIGN KEY ("code_cooperative_id") REFERENCES "cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "station" ADD CONSTRAINT "fk_9f39f8b1c6359aba" FOREIGN KEY ("code_cooperative_id") REFERENCES "cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "station_trajet" ADD CONSTRAINT "fk_e4b9ba6a21bdb235" FOREIGN KEY ("station_id") REFERENCES "station"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "station_trajet" ADD CONSTRAINT "fk_e4b9ba6ad12a823" FOREIGN KEY ("trajet_id") REFERENCES "trajet"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voiture" ADD CONSTRAINT "fk_e9e2810f9134fd3" FOREIGN KEY ("code_station_id") REFERENCES "station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voiture" ADD CONSTRAINT "fk_e9e2810fc6359aba" FOREIGN KEY ("code_cooperative_id") REFERENCES "cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voiture_chauffeur" ADD CONSTRAINT "fk_c6d358fc181a8ba" FOREIGN KEY ("voiture_id") REFERENCES "voiture"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voiture_chauffeur" ADD CONSTRAINT "fk_c6d358fc85c0b3be" FOREIGN KEY ("chauffeur_id") REFERENCES "chauffeur"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "fk_3f9d8955292f555c" FOREIGN KEY ("code_voiture_id") REFERENCES "voiture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "fk_3f9d89554ee841db" FOREIGN KEY ("code_chauffeur_id") REFERENCES "chauffeur"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "fk_3f9d8955a157d01b" FOREIGN KEY ("code_trajet_id") REFERENCES "trajet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "fk_3f9d8955c6359aba" FOREIGN KEY ("code_cooperative_id") REFERENCES "cooperative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
