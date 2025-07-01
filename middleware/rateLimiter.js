// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// Limiteur de taux général pour l'API
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par `window` (ici, 15 minutes)
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes',
    handler: (req, res, next) => {
        next(new ApiError('Trop de requêtes depuis cette IP, veuillez réessayer plus tard.', 429));
    },
    // store: ... // Vous pouvez configurer un magasin (Redis) pour le partage entre plusieurs instances
});

// Limiteur de taux plus strict pour l'authentification (login, register, forgot-password)
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limite à 10 tentatives de connexion/enregistrement par 15 minutes
    message: 'Trop de tentatives de connexion/enregistrement, veuillez réessayer après 15 minutes',
    handler: (req, res, next) => {
        next(new ApiError('Trop de tentatives, veuillez réessayer plus tard.', 429));
    },
});

// Comment l'utiliser dans les routes :
// app.use('/api/', apiLimiter); // Appliquer à toutes les routes API (dans app.js)
// router.post('/login', authLimiter, authController.login); // Appliquer spécifiquement aux routes d'authentification