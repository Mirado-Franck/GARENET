import jwt from 'jsonwebtoken';

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} payload - Données à encoder dans le token
 * @returns {String} Token JWT
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  
  // En développement, pas d'expiration définie
  const options = {};
  if (process.env.JWT_EXPIRES_IN) {
    options.expiresIn = process.env.JWT_EXPIRES_IN;
  }

  return jwt.sign(payload, secret, options);
};

/**
 * Vérifie et décode un token JWT
 * @param {String} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};