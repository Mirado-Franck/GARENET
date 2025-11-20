// backend/services/mvolaService.js
import axios from 'axios';

/**
 * 🔵 SERVICE MVOLA - Gestion des paiements Mobile Money
 * 
 * Modes :
 * - SIMULATION : Pour développement/tests (pas d'API externe)
 * - SANDBOX : API MVola de test (nécessite clés développeur)
 * - PRODUCTION : API MVola réelle
 */

const MODE = process.env.MVOLA_MODE || 'SIMULATION'; // 'SIMULATION' | 'SANDBOX' | 'PRODUCTION'

// Configuration MVola (à remplir avec vos clés)
const MVOLA_CONFIG = {
  CONSUMER_KEY: process.env.MVOLA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MVOLA_CONSUMER_SECRET || '',
  API_URL: process.env.MVOLA_API_URL || 'https://devapi.mvola.mg',
  CALLBACK_URL: process.env.MVOLA_CALLBACK_URL || 'http://localhost:3000/api/paiements/callback'
};

/**
 * ========================================
 * MODE SIMULATION (Développement local)
 * ========================================
 */
const simulatePayment = async (numero_mvola, montant, reference) => {
  console.log('💳 [SIMULATION] Paiement MVola');
  console.log(`   Numéro: ${numero_mvola}`);
  console.log(`   Montant: ${montant} Ar`);
  console.log(`   Référence: ${reference}`);

  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Normaliser le numéro (enlever espaces, tirets)
  const numeroNormalized = numero_mvola.replace(/[\s-]/g, '');

  // ✅ Numéros de test SUCCESS
  const successNumbers = [
    '0340000001',
    '0340000011',
    '0330000001',
    '0380000001'
  ];

  // ❌ Numéros de test FAILED
  const failedNumbers = [
    '0340000002',
    '0320000001'
  ];

  // ⏳ Numéros de test PENDING (on les traite comme SUCCESS pour simplifier)
  const pendingNumbers = [
    '0340000003'
  ];

  // Déterminer le résultat
  let success = false;
  let status = 'FAILED';
  let message = 'Paiement refusé par MVola';

  if (successNumbers.includes(numeroNormalized)) {
    success = true;
    status = 'SUCCESS';
    message = 'Paiement accepté avec succès';
  } else if (pendingNumbers.includes(numeroNormalized)) {
    success = true;
    status = 'SUCCESS';
    message = 'Paiement en cours de traitement';
  } else if (failedNumbers.includes(numeroNormalized)) {
    success = false;
    status = 'FAILED';
    message = 'Solde insuffisant';
  } else {
    // Par défaut, accepter les autres numéros valides
    if (numeroNormalized.length === 10 && /^03[2-48]/.test(numeroNormalized)) {
      success = true;
      status = 'SUCCESS';
      message = 'Paiement accepté (simulation)';
    }
  }

  const transaction_id = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const result = {
    success,
    status,
    transaction_id,
    message,
    amount: montant,
    numero_mvola: numero_mvola,
    reference,
    timestamp: new Date().toISOString()
  };

  console.log(`   Résultat: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Transaction ID: ${transaction_id}`);

  return result;
};

/**
 * ========================================
 * MODE SANDBOX / PRODUCTION (Vraie API MVola)
 * ========================================
 */

// Fonction pour obtenir le token OAuth2
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      `${MVOLA_CONFIG.API_URL}/token`,
      new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      {
        auth: {
          username: MVOLA_CONFIG.CONSUMER_KEY,
          password: MVOLA_CONFIG.CONSUMER_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('❌ Erreur obtention token MVola:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir le token MVola');
  }
};

// Initier une transaction MVola réelle
const initRealPayment = async (numero_mvola, montant, reference) => {
  try {
    console.log('💳 [MVOLA API] Initiation paiement');

    // 1. Obtenir le token
    const accessToken = await getAccessToken();

    // 2. Préparer la requête de transaction
    const transactionData = {
      amount: montant,
      currency: 'Ar',
      descriptionText: `Paiement GARENET - ${reference}`,
      requestingOrganisationTransactionReference: reference,
      requestDate: new Date().toISOString(),
      debitParty: [
        {
          key: 'msisdn',
          value: numero_mvola.replace(/[\s-]/g, '') // Numéro client
        }
      ],
      creditParty: [
        {
          key: 'msisdn',
          value: process.env.MVOLA_MERCHANT_NUMBER || '0340000000' // Votre numéro marchand
        }
      ],
      metadata: [
        {
          key: 'partnerName',
          value: 'GARENET'
        }
      ]
    };

    // 3. Envoyer la requête
    const response = await axios.post(
      `${MVOLA_CONFIG.API_URL}/mvola/mm/transactions/type/merchantpay/1.0.0/`,
      transactionData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-CorrelationID': `GARENET-${Date.now()}`
        }
      }
    );

    const { status, serverCorrelationId } = response.data;

    return {
      success: status === 'SUCCESS',
      status,
      transaction_id: serverCorrelationId,
      message: status === 'SUCCESS' ? 'Paiement accepté' : 'Paiement refusé',
      amount: montant,
      numero_mvola,
      reference,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erreur paiement MVola:', error.response?.data || error.message);
    
    return {
      success: false,
      status: 'FAILED',
      transaction_id: null,
      message: error.response?.data?.message || 'Erreur lors du paiement',
      amount: montant,
      numero_mvola,
      reference,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * ========================================
 * FONCTION PRINCIPALE (Switch selon MODE)
 * ========================================
 */
export const processPayment = async (numero_mvola, montant, reference) => {
  console.log(`\n🔵 MODE PAIEMENT: ${MODE}`);

  switch (MODE) {
    case 'SIMULATION':
      return await simulatePayment(numero_mvola, montant, reference);
    
    case 'SANDBOX':
    case 'PRODUCTION':
      return await initRealPayment(numero_mvola, montant, reference);
    
    default:
      throw new Error(`Mode MVola invalide: ${MODE}`);
  }
};

/**
 * Vérifier le statut d'une transaction
 */
export const checkTransactionStatus = async (transaction_id) => {
  if (MODE === 'SIMULATION') {
    return {
      status: 'SUCCESS',
      transaction_id,
      message: 'Transaction simulée validée'
    };
  }

  // Pour SANDBOX/PRODUCTION : appel API de vérification
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.get(
      `${MVOLA_CONFIG.API_URL}/mvola/mm/transactions/${transaction_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erreur vérification transaction:', error);
    throw new Error('Impossible de vérifier la transaction');
  }
};

// Export des configurations pour debugging
export const getMvolaConfig = () => ({
  mode: MODE,
  configured: !!(MVOLA_CONFIG.CONSUMER_KEY && MVOLA_CONFIG.CONSUMER_SECRET)
});