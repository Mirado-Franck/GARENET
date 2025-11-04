import { verifyToken } from '../utils/jwtUtils.js';

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token dans les headers
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant. Veuillez vous connecter.'
      });
    }

    // 2. Extraire le token (format: "Bearer TOKEN")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Format de token invalide.'
      });
    }

    // 3. Vérifier et décoder le token
    const decoded = verifyToken(token);

    // 4. Ajouter les infos utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type_utilisateur: decoded.type_utilisateur
    };

    console.log('✅ Utilisateur authentifié:', req.user.email);

    // 5. Passer au middleware/controller suivant
    next();

  } catch (error) {
    console.error('❌ Erreur authentification JWT:', error.message);
    
    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré. Veuillez vous reconnecter.'
    });
  }
};

/**
 * Middleware pour vérifier les rôles spécifiques
 * Utilisation: checkRole(['admin', 'cooperative'])
 */
export const checkRole = (rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié.'
      });
    }

    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Rôle insuffisant.'
      });
    }

    next();
  };
};