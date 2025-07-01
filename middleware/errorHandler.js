// backend/src/middlewares/errorHandler.js
const ApiError = require('../utils/ApiError');
const RESPONSE_MESSAGES = require('../utils/constants/responseMessages'); // Pour les messages standardisés

/**
 * @desc Middleware de gestion d'erreurs global pour l'application.
 * Il intercepte les erreurs, détermine leur type et envoie une réponse d'erreur standardisée.
 *
 * @param {Error} err - L'objet erreur.
 * @param {object} req - L'objet requête Express.
 * @param {object} res - L'objet réponse Express.
 * @param {function} next - La fonction de middleware Express suivante.
 */
const errorHandler = (err, req, res, next) => {
    // Initialise les propriétés d'erreur par défaut
    let error = { ...err }; // Crée une copie de l'objet erreur pour ne pas modifier l'original
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error'; // 'fail' pour les erreurs client, 'error' pour les erreurs serveur

    // Log l'erreur complète pour le débogage côté serveur.
    // En production, envisagez d'utiliser un logger plus robuste (Winston, Pino).
    console.error(`ERROR ${error.statusCode}: ${error.message}`);
    // console.error(err.stack); // Décommenter en développement pour voir la trace complète

    // --- Gestion des types d'erreurs spécifiques ---

    // Erreurs de validation de Mongoose (ex: champs requis manquants, formats invalides)
    if (err.name === 'ValidationError') {
        // Extrait les messages d'erreur de Mongoose
        const errors = Object.values(err.errors).map(val => val.message);
        error = new ApiError(errors.join(', '), 400); // 400 Bad Request
    }

    // Erreur de clé dupliquée Mongoose (code 11000)
    if (err.code === 11000) {
        // Tente d'extraire la valeur dupliquée du message d'erreur de MongoDB
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
        const message = value ? `Valeur dupliquée pour le champ: ${value[0]}. Veuillez utiliser une autre valeur.` : 'Donnée dupliquée.';
        error = new ApiError(message, 400); // 400 Bad Request
    }

    // Erreur CastError (ex: ID MongoDB invalide pour `findById`)
    if (err.name === 'CastError') {
        const message = `Ressource non trouvée. ID invalide: ${err.value} pour le champ ${err.path}.`;
        error = new ApiError(message, 404); // 404 Not Found
    }

    // Erreur JsonWebTokenError (JWT malformé ou signature invalide)
    if (err.name === 'JsonWebTokenError') {
        const message = RESPONSE_MESSAGES.UNAUTHORIZED;
        error = new ApiError(message, 401); // 401 Unauthorized
    }

    // Erreur TokenExpiredError (JWT expiré)
    if (err.name === 'TokenExpiredError') {
        const message = 'Le jeton d\'authentification a expiré. Veuillez vous reconnecter.';
        error = new ApiError(message, 401); // 401 Unauthorized
    }

    // --- Envoi de la réponse d'erreur au client ---

    // Distinguer le mode de développement du mode de production pour la sécurité
    if (process.env.NODE_ENV === 'development') {
        // En développement, renvoie tous les détails de l'erreur pour faciliter le débogage
        res.status(error.statusCode).json({
            success: false,
            status: error.status,
            message: error.message,
            stack: err.stack, // Trace de la pile complète
            error: err // L'objet erreur original
        });
    } else {
        // En production, on envoie des messages d'erreur génériques pour la sécurité,
        // mais les erreurs "opérationnelles" (celles que nous avons levées via ApiError)
        // peuvent avoir des messages plus spécifiques.
        if (error.isOperational) {
            res.status(error.statusCode).json({
                success: false,
                status: error.status,
                message: error.message,
            });
        } else {
            // Pour les erreurs non opérationnelles (bugs de programmation inattendus),
            // on cache les détails et on renvoie un message d'erreur générique 500.
            res.status(500).json({
                success: false,
                status: 'error',
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
};

module.exports = errorHandler;