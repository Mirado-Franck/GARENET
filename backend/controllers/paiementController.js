import { PrismaClient } from "../generated/prisma/index.js";
import { processPayment } from "../services/mvolaService.js";
import { sendPushNotification } from "../services/pushNotificationService.js";
import crypto from "crypto";
import { sendPaymentEmail } from "../services/emailService.js";

const prisma = new PrismaClient();

function genCode(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

const normalizeAmount = (value) => {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const roundMoney = (n) => Math.round(n * 100) / 100; // sécurité float
const EPS = 0.01;

// ========================================
// ✅ PAIEMENT ÉCHELONNÉ (partiel ou total)
// ========================================
const processCompletePayment = async (req, res) => {
  try {
    console.log("\n🔵 ===== DÉBUT PAIEMENT RÉSERVATION (ECHELONNE) =====");

    const code_client_id = req.user?.id;
    if (!code_client_id) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { reservation_id, numero_mvola, montant } = req.body;

    console.log("📋 Données reçues:", { reservation_id, numero_mvola, montant, code_client_id });

    if (!reservation_id || !numero_mvola || montant === undefined || montant === null) {
      return res.status(400).json({
        error: "Données manquantes",
        required: ["reservation_id", "numero_mvola", "montant"],
      });
    }

    const montantDemande = normalizeAmount(montant);
    if (!Number.isFinite(montantDemande) || montantDemande <= 0) {
      return res.status(400).json({ error: "Montant invalide (doit être un nombre > 0)" });
    }

    // 1) Charger la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(reservation_id) },
      include: {
        voyage: {
          include: {
            trajet: true,
            cooperative: true,
          },
        },
        places: { include: { place: true } },
        client: { include: { utilisateur: true } },
        paiement: true,
        recu: true,
      },
    });

    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    if (reservation.code_client_id !== code_client_id) {
      return res.status(403).json({ error: "Cette réservation ne vous appartient pas" });
    }

    // 2) Statuts bloquants
    const statut = (reservation.statut || "").toLowerCase().trim();

    if (statut === "annulee" || statut === "annulée") {
      return res.status(400).json({ error: "Cette réservation a été annulée" });
    }

    if (statut === "confirmee" || statut === "confirmée") {
      return res.status(400).json({ error: "Cette réservation est déjà payée" });
    }

    // Statuts autorisés pour payer
    const statutOk =
      statut === "en attente" ||
      statut === "paye_partiel" ||
      statut === "payee_partiellement" ||
      statut === "payée_partiellement";

    if (!statutOk) {
      return res.status(400).json({
        error: "Statut de réservation invalide pour le paiement",
        statut_actuel: reservation.statut,
      });
    }

    // 3) Calcul total / déjà payé / restant
    const totalDu = roundMoney(reservation.voyage.prix * reservation.nombre_places);

    const dejaPaye = roundMoney(
      (reservation.paiement || [])
        .filter((p) => p.deleted_at === null && p.status === "valide")
        .reduce((sum, p) => sum + Number(p.montant || 0), 0)
    );

    const restantAvant = roundMoney(totalDu - dejaPaye);

    if (restantAvant <= EPS) {
      return res.status(400).json({ error: "Cette réservation est déjà soldée" });
    }

    if (montantDemande - restantAvant > EPS) {
      return res.status(400).json({
        error: "Montant supérieur au restant à payer",
        total: totalDu,
        deja_paye: dejaPaye,
        restant: restantAvant,
        montant_demande: montantDemande,
      });
    }

    // 4) Appel MVola
    console.log("💳 Appel MVola (montant partiel possible)...");
    const mvolaResult = await processPayment(numero_mvola, montantDemande, reservation.code_reservation);

    console.log("📊 Résultat MVola:", mvolaResult);

    if (!mvolaResult.success) {
      console.log("❌ Paiement refusé par MVola");
      return res.status(402).json({
        success: false,
        error: "Paiement refusé",
        message: mvolaResult.message,
        mvola_status: mvolaResult.status,
      });
    }

    console.log("✅ Paiement accepté par MVola");

    // 5) Transaction atomique
    const resultat = await prisma.$transaction(async (tx) => {
      const agg = await tx.paiement.aggregate({
        where: {
          code_reservation_id: reservation.id,
          deleted_at: null,
          status: "valide",
        },
        _sum: { montant: true },
      });

      const dejaPayeTx = roundMoney(Number(agg._sum.montant || 0));
      const restantAvantTx = roundMoney(totalDu - dejaPayeTx);

      if (restantAvantTx <= EPS) throw new Error("RESERVATION_DEJA_SOLDEE");
      if (montantDemande - restantAvantTx > EPS) throw new Error("MONTANT_SUPERIEUR_AU_RESTANT");

      const restantApres = roundMoney(restantAvantTx - montantDemande);

      const paiement = await tx.paiement.create({
        data: {
          code_reservation_id: reservation.id,
          code_paiement: genCode("PAY"),
          montant: roundMoney(montantDemande),
          mode_paiement: "MVola",
          date_paiement: new Date(),
          status: "valide",
          paiement_restant: restantApres,
        },
      });

      const nouveauStatut = restantApres > EPS ? "paye_partiel" : "confirmee";

      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: { statut: nouveauStatut },
      });

      // Reçu uniquement si soldé (et si aucun reçu existant)
      let recu = null;
      if (restantApres <= EPS) {
        const existingRecu = await tx.recu.findFirst({
          where: { code_reservation_id: reservation.id },
        });

        if (!existingRecu) {
          const qrData = `GARENET-${reservation.code_reservation}-${reservation.voyage.code_voyage}`;
          recu = await tx.recu.create({
            data: {
              code_reservation_id: reservation.id,
              code_recu: genCode("RECU"),
              date_emission: new Date(),
              qr_code: qrData,
              format: "PDF",
            },
          });
        }
      }

      const depart = reservation.voyage.trajet.station_depart;
      const arrivee = reservation.voyage.trajet.station_arrivee;
      const placesNumeros = reservation.places.map((p) => p.place.numero).join(", ");

      const notifType = restantApres > EPS ? "paiement_partiel" : "paiement_confirme";

      const notificationContent =
        restantApres > EPS
          ? `💳 Paiement partiel reçu (${roundMoney(montantDemande)} Ar). Reste à payer : ${restantApres.toLocaleString()} Ar. Voyage ${depart} → ${arrivee}. Places : ${placesNumeros}.`
          : `✅ Paiement final confirmé ! Voyage ${depart} → ${arrivee}. Places : ${placesNumeros}. Montant total : ${totalDu.toLocaleString()} Ar.`;

      const notification = await tx.notification.create({
        data: {
          ref_notification: genCode("NOTIF"),
          ref_utilisateur_id: code_client_id,
          type: notifType,
          contenu: notificationContent,
          date_envoi: new Date(),
          statut: "non_lu",
          canal: "app",
        },
      });

      return {
        reservation: updatedReservation,
        paiement,
        recu,
        notification,
        dejaPayeTx,
        restantApres,
        totalDu,
      };
    });

    // 6) Push notification (non bloquant)
    try {
      const depart = reservation.voyage.trajet.station_depart;
      const arrivee = reservation.voyage.trajet.station_arrivee;
      const isPartial = resultat.restantApres > EPS;

      const pushTitle = isPartial ? "💳 Paiement partiel reçu" : "✅ Paiement confirmé";
      const pushBody = isPartial
        ? `Vous avez payé ${roundMoney(montantDemande).toLocaleString()} Ar. Reste : ${resultat.restantApres.toLocaleString()} Ar. (${depart} → ${arrivee})`
        : `Votre réservation est confirmée. (${depart} → ${arrivee})`;

      await sendPushNotification(code_client_id, pushTitle, pushBody, {
        type: isPartial ? "paiement_partiel" : "paiement_confirme",
        reservationId: reservation.id,
        code_reservation: reservation.code_reservation,
        voyageId: reservation.voyage.id,
        restant: resultat.restantApres,
      });

      console.log("📱 Push envoyé");
    } catch (pushError) {
      console.error("⚠️ Erreur envoi push (non bloquant):", pushError?.message || pushError);
    }

    // 7) Email (non bloquant) à chaque paiement
    try {
      const email = reservation?.client?.utilisateur?.email;
      if (email) {
        const prenoms = reservation.client.utilisateur.prenoms || "";
        const nom = reservation.client.utilisateur.nom || "";
        const clientName = `${prenoms} ${nom}`.trim();

        const isPartial = resultat.restantApres > EPS;

        await sendPaymentEmail({
          to: email,
          clientName,
          isPartial,
          codeReservation: reservation.code_reservation,
          codePaiement: resultat.paiement.code_paiement,
          montantPayeMaintenant: montantDemande,
          total: resultat.totalDu,
          dejaPaye: roundMoney(resultat.totalDu - resultat.restantApres),
          restant: resultat.restantApres,
          trajet: `${reservation.voyage.trajet.station_depart} → ${reservation.voyage.trajet.station_arrivee}`,
          dateDepart: reservation.voyage.date_depart,
          cooperativeName: reservation.voyage.cooperative.nom,
        });

        console.log("📧 Email paiement envoyé à", email);
      } else {
        console.log("⚠️ Email client absent, pas d’envoi email");
      }
    } catch (mailError) {
      console.error("⚠️ Erreur envoi email (non bloquant):", mailError?.message || mailError);
    }

    console.log("✅ ===== FIN PAIEMENT RÉSERVATION (ECHELONNE) =====\n");

    return res.status(200).json({
      success: true,
      message:
        resultat.restantApres > EPS
          ? "Paiement partiel enregistré. Vous pouvez payer le reste plus tard."
          : "Paiement validé. Réservation confirmée !",
      data: {
        reservation: {
          id: reservation.id,
          code: reservation.code_reservation,
          statut: resultat.reservation.statut,
          nombre_places: reservation.nombre_places,
        },
        paiement: {
          code: resultat.paiement.code_paiement,
          montant: resultat.paiement.montant,
          mode: resultat.paiement.mode_paiement,
          mvola_transaction_id: mvolaResult.transaction_id,
        },
        recu: resultat.recu ? { code: resultat.recu.code_recu, qr_code: resultat.recu.qr_code } : null,
        montant: {
          total: resultat.totalDu,
          deja_paye: roundMoney(resultat.totalDu - resultat.restantApres),
          restant: resultat.restantApres,
        },
        voyage: {
          trajet: `${reservation.voyage.trajet.station_depart} → ${reservation.voyage.trajet.station_arrivee}`,
          date: reservation.voyage.date_depart,
          cooperative: reservation.voyage.cooperative.nom,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erreur processCompletePayment:", error);

    if (error?.message === "RESERVATION_DEJA_SOLDEE") {
      return res.status(409).json({ success: false, error: "Réservation déjà soldée" });
    }
    if (error?.message === "MONTANT_SUPERIEUR_AU_RESTANT") {
      return res.status(409).json({ success: false, error: "Montant supérieur au restant" });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors du traitement du paiement",
      details: error.message,
    });
  }
};

// === CRÉER UN PAIEMENT SIMPLE (ancienne fonction conservée) ===
const createPaiement = async (req, res, next) => {
  try {
    const { code_reservation_id, montant, mode_paiement, paiement_restant } = req.body;

    if (!code_reservation_id || !montant || !mode_paiement) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: code_reservation_id },
      include: { voyage: true, paiement: true },
    });

    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    if (reservation.statut === "confirmee" || reservation.statut === "confirmée") {
      return res.status(400).json({ error: "Réservation déjà payée" });
    }

    if (reservation.statut === "annulee" || reservation.statut === "annulée") {
      return res.status(400).json({ error: "Réservation annulée" });
    }

    const totalDu = reservation.voyage.prix * reservation.nombre_places;
    const dejaPaye = reservation.paiement.reduce((sum, p) => sum + p.montant, 0);
    const montantDu = totalDu - dejaPaye;

    if (montant > montantDu) {
      return res.status(400).json({ error: "Montant supérieur au dû", montant_du: montantDu });
    }

    const code_paiement = genCode("PAY");

    const paiement = await prisma.paiement.create({
      data: {
        code_reservation_id,
        code_paiement,
        montant: parseFloat(montant),
        mode_paiement,
        date_paiement: new Date(),
        status: "valide",
        paiement_restant:
          paiement_restant !== undefined ? parseFloat(paiement_restant) : montantDu - montant,
      },
      include: {
        reservation: {
          include: { client: true, voyage: true },
        },
      },
    });

    const nouveauRestant = montantDu - montant;
    let nouveauStatut = reservation.statut;

    if (nouveauRestant <= 0) {
      nouveauStatut = "confirmée";
    } else if (montant > 0) {
      nouveauStatut = "paye_partiel";
    }

    await prisma.reservation.update({
      where: { id: code_reservation_id },
      data: { statut: nouveauStatut },
    });

    res.status(201).json({
      message: "Paiement enregistré avec succès",
      paiement,
      montant_restant: nouveauRestant,
    });
  } catch (err) {
    console.error("Erreur createPaiement:", err);
    next(err);
  }
};

// === RÉCUPÉRER LES PAIEMENTS D'UN CLIENT ===
const getPaiements = async (req, res, next) => {
  try {
    const clientId = req.user?.id || req.body.code_client_id;
    if (!clientId) return res.status(400).json({ error: "ID client manquant" });

    const paiements = await prisma.paiement.findMany({
      where: {
        reservation: { code_client_id: clientId },
        deleted_at: null,
      },
      include: {
        reservation: {
          include: {
            voyage: {
              include: {
                trajet: true,
                cooperative: true,
              },
            },
            places: { include: { place: true } },
          },
        },
      },
      orderBy: { date_paiement: "desc" },
    });

    res.json(paiements);
  } catch (err) {
    console.error("Erreur getPaiements:", err);
    next(err);
  }
};

export { createPaiement, getPaiements, processCompletePayment };