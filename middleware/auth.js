// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler'); // Un utilitaire pour gérer les promesses dans les middlewares
const User = require('../models/User'); // Le modèle User
const ApiError = require('../utils/ApiError'); // Votre classe d'erreur personnalisée

/**
 * Middleware pour protéger les routes.
 * Vérifie la présence et la validité du JWT.
 */
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Vérifier si le token est dans l'en-tête Authorization (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Alternative : Si le token est dans les cookies (pour les applications web traditionnelles)
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Vérifier si le token existe
    if (!token) {
        return next(new ApiError('Non autorisé : Aucun token fourni', 401));
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Trouver l'utilisateur et l'attacher à la requête
        req.user = await User.findById(decoded.id).select('-password'); // Exclure le mot de passe
        if (!req.user) {
            return next(new ApiError('Non autorisé : Utilisateur non trouvé', 401));
        }

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError('Non autorisé : Token invalide', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError('Non autorisé : Token expiré', 401));
        }
        next(error); // Passer d'autres erreurs à l'errorHandler global
    }
});