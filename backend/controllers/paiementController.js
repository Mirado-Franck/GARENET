import { PrismaClient } from "../generated/prisma/index.js";
import { processPayment } from "../services/mvolaService.js";
import crypto from 'crypto';

const prisma = new PrismaClient();

function genCode(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

// ========================================
// ✨ FONCTION PRINCIPALE MODIFIÉE
// ========================================

/**
 * 🔥 TRAITEMENT COMPLET : PAIEMENT D'UNE RÉSERVATION EXISTANTE
 * 
 * Cette fonction gère le paiement d'une réservation "en attente" :
 * 1. Récupérer la réservation existante
 * 2. Appeler MVola pour le paiement
 * 3. Si paiement OK → Mettre à jour le statut + créer paiement + notification + reçu
 * 4. Si paiement KO → Retourner erreur
 */
const processCompletePayment = async (req, res, next) => {
  try {
    console.log('\n🔵 ===== DÉBUT PAIEMENT RÉSERVATION =====');
    
    // ========================================
    // 1. RÉCUPÉRATION ET VALIDATION DES DONNÉES
    // ========================================
    const code_client_id = req.user?.id;
    if (!code_client_id) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    const { 
      reservation_id,    // ✅ NOUVEAU : ID de la réservation existante
      numero_mvola,      // "034 00 000 01"
      montant 
    } = req.body;

    console.log('📋 Données reçues:', {
      reservation_id,
      numero_mvola,
      montant,
      code_client_id
    });

    // Validation
    if (!reservation_id || !numero_mvola || !montant) {
      return res.status(400).json({ 
        error: "Données manquantes",
        required: ["reservation_id", "numero_mvola", "montant"]
      });
    }

    // ========================================
    // 2. CHARGER LA RÉSERVATION EXISTANTE
    // ========================================
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(reservation_id) },
      include: {
        voyage: {
          include: {
            trajet: true,
            cooperative: true
          }
        },
        places: {
          include: {
            place: true
          }
        },
        client: {
          include: {
            utilisateur: true
          }
        },
        paiement: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    // Vérifier que c'est bien la réservation du client connecté
    if (reservation.code_client_id !== code_client_id) {
      return res.status(403).json({ error: "Cette réservation ne vous appartient pas" });
    }

    // Vérifier le statut
    if (reservation.statut === 'confirmee' || reservation.statut === 'confirmée') {
      return res.status(400).json({ error: "Cette réservation est déjà payée" });
    }

    if (reservation.statut === 'annulee' || reservation.statut === 'annulée') {
      return res.status(400).json({ error: "Cette réservation a été annulée" });
    }

    if (reservation.statut !== 'en attente') {
      return res.status(400).json({ 
        error: "Statut de réservation invalide pour le paiement",
        statut_actuel: reservation.statut 
      });
    }

    // Vérifier qu'il n'y a pas déjà un paiement
    if (reservation.paiement && reservation.paiement.length > 0) {
      return res.status(400).json({ error: "Un paiement existe déjà pour cette réservation" });
    }

    // Vérifier le montant
    const montantAttendu = reservation.voyage.prix * reservation.nombre_places;
    if (parseFloat(montant) !== montantAttendu) {
      return res.status(400).json({ 
        error: "Montant incorrect",
        attendu: montantAttendu,
        recu: parseFloat(montant)
      });
    }

    // ========================================
    // 3. APPEL MVOLA - PAIEMENT
    // ========================================
    console.log('💳 Appel MVola...');
    const mvolaResult = await processPayment(
      numero_mvola,
      montant,
      reservation.code_reservation
    );

    console.log('📊 Résultat MVola:', mvolaResult);

    // ❌ Si paiement refusé
    if (!mvolaResult.success) {
      console.log('❌ Paiement refusé par MVola');
      return res.status(402).json({
        success: false,
        error: "Paiement refusé",
        message: mvolaResult.message,
        mvola_status: mvolaResult.status
      });
    }

    console.log('✅ Paiement accepté par MVola');

    // ========================================
    // 4. TRANSACTION ATOMIQUE - MISE À JOUR
    // ========================================
    const resultat = await prisma.$transaction(async (tx) => {
      console.log('🔒 Début transaction atomique...');

      // 4a. Mettre à jour le statut de la réservation
      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: { statut: 'confirmee' }  // ✅ Passer de "en attente" à "confirmee"
      });
      console.log(`  ✅ Réservation mise à jour: ${updatedReservation.code_reservation}`);

      // 4b. Créer le paiement
      const paiement = await tx.paiement.create({
        data: {
          code_reservation_id: reservation.id,
          code_paiement: genCode('PAY'),
          montant: parseFloat(montant),
          mode_paiement: 'MVola',
          date_paiement: new Date(),
          status: 'valide',
          paiement_restant: 0
        }
      });
      console.log(`  ✅ Paiement enregistré: ${paiement.code_paiement}`);

      // 4c. Générer le reçu
      const qrData = `GARENET-${reservation.code_reservation}-${reservation.voyage.code_voyage}`;
      const recu = await tx.recu.create({
        data: {
          code_reservation_id: reservation.id,
          code_recu: genCode('RECU'),
          date_emission: new Date(),
          qr_code: qrData,
          format: 'PDF'
        }
      });
      console.log(`  ✅ Reçu généré: ${recu.code_recu}`);

      // 4d. Créer la notification
      const placesNumeros = reservation.places.map(p => p.place.numero).join(', ');
      const notificationContent = `✅ Paiement confirmé ! Voyage ${reservation.voyage.trajet.station_depart} → ${reservation.voyage.trajet.station_arrivee} le ${new Date(reservation.voyage.date_depart).toLocaleDateString('fr-FR')}. Places : ${placesNumeros}. Montant : ${montant} Ar`;
      
      const notification = await tx.notification.create({
        data: {
          ref_notification: genCode('NOTIF'),
          ref_utilisateur_id: code_client_id,
          type: 'paiement_confirme',
          contenu: notificationContent,
          date_envoi: new Date(),
          statut: 'non_lu',
          canal: 'app'
        }
      });
      console.log(`  ✅ Notification créée: ${notification.ref_notification}`);

      return {
        reservation: updatedReservation,
        paiement,
        recu,
        notification
      };
    });

    console.log('🔓 Transaction atomique terminée avec succès');

    // ========================================
    // 5. RÉPONSE FINALE
    // ========================================
    const placesNumeros = reservation.places.map(p => p.place.numero);

    console.log('✅ ===== FIN PAIEMENT RÉSERVATION =====\n');

    return res.status(200).json({
      success: true,
      message: "Paiement validé et réservation confirmée !",
      data: {
        reservation: {
          id: resultat.reservation.id,
          code: resultat.reservation.code_reservation,
          statut: resultat.reservation.statut,
          nombre_places: resultat.reservation.nombre_places,
          places: placesNumeros
        },
        paiement: {
          code: resultat.paiement.code_paiement,
          montant: resultat.paiement.montant,
          mode: resultat.paiement.mode_paiement,
          mvola_transaction_id: mvolaResult.transaction_id
        },
        recu: {
          code: resultat.recu.code_recu,
          qr_code: resultat.recu.qr_code
        },
        voyage: {
          trajet: `${reservation.voyage.trajet.station_depart} → ${reservation.voyage.trajet.station_arrivee}`,
          date: reservation.voyage.date_depart,
          cooperative: reservation.voyage.cooperative.nom
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur processCompletePayment:', error);

    return res.status(500).json({
      success: false,
      error: "Erreur lors du traitement du paiement",
      details: error.message
    });
  }
};

// === CRÉER UN PAIEMENT SIMPLE (ancienne fonction conservée) ===
const createPaiement = async (req, res, next) => {
  try {
    const {
      code_reservation_id,
      montant,
      mode_paiement,
      paiement_restant
    } = req.body;

    // === VALIDATION ===
    if (!code_reservation_id || !montant || !mode_paiement) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    // === VÉRIFIER LA RÉSERVATION ===
    const reservation = await prisma.reservation.findUnique({
      where: { id: code_reservation_id },
      include: {
        voyage: true,
        paiement: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    if (reservation.statut === "confirmee" || reservation.statut === "confirmée") {
      return res.status(400).json({ error: "Réservation déjà payée" });
    }

    if (reservation.statut === "annulee" || reservation.statut === "annulée") {
      return res.status(400).json({ error: "Réservation annulée" });
    }

    // === CALCUL DU MONTANT TOTAL ET RESTANT ===
    const totalDu = reservation.voyage.prix * reservation.nombre_places;
    const dejaPaye = reservation.paiement.reduce((sum, p) => sum + p.montant, 0);
    const montantDu = totalDu - dejaPaye;

    if (montant > montantDu) {
      return res.status(400).json({
        error: "Montant supérieur au dû",
        montant_du: montantDu
      });
    }

    // === GÉNÉRER code_paiement ===
    const code_paiement = genCode('PAY');

    // === CRÉER LE PAIEMENT ===
    const paiement = await prisma.paiement.create({
      data: {
        code_reservation_id,
        code_paiement,
        montant: parseFloat(montant),
        mode_paiement,
        date_paiement: new Date(),
        status: "valide",
        paiement_restant: paiement_restant !== undefined ? parseFloat(paiement_restant) : (montantDu - montant)
      },
      include: {
        reservation: {
          include: {
            client: true,
            voyage: true
          }
        }
      }
    });

    // === METTRE À JOUR LE STATUT DE LA RÉSERVATION ===
    const nouveauRestant = montantDu - montant;
    let nouveauStatut = reservation.statut;

    if (nouveauRestant <= 0) {
      nouveauStatut = "confirmée";
    } else if (montant > 0) {
      nouveauStatut = "payée_partiellement";
    }

    await prisma.reservation.update({
      where: { id: code_reservation_id },
      data: { statut: nouveauStatut }
    });

    res.status(201).json({
      message: "Paiement enregistré avec succès",
      paiement,
      montant_restant: nouveauRestant
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
    if (!clientId) {
      return res.status(400).json({ error: "ID client manquant" });
    }

    const paiements = await prisma.paiement.findMany({
      where: {
        reservation: {
          code_client_id: clientId
        },
        deleted_at: null
      },
      include: {
        reservation: {
          include: {
            voyage: { 
              include: { 
                trajet: true,
                cooperative: true  // ✅ AJOUT : Inclure la coopérative
              } 
            },
            places: { include: { place: true } }
          }
        }
      },
      orderBy: { date_paiement: "desc" }
    });

    res.json(paiements);
  } catch (err) {
    console.error("Erreur getPaiements:", err);
    next(err);
  }
};

export { createPaiement, getPaiements, processCompletePayment };