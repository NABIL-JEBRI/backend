// backend/src/app.js
const express = require('express');
const morgan = require('morgan'); // Pour le logging des requêtes HTTP
const cors = require('cors');     // Pour la gestion des requêtes cross-origin
const helmet = require('helmet'); // Pour la sécurité des en-têtes HTTP
const mongoSanitize = require('express-mongo-sanitize'); // Pour la prévention de l'injection NoSQL
const xss = require('xss-clean'); // Pour la prévention des attaques XSS (Cross-Site Scripting)
const hpp = require('hpp');       // Pour la prévention de la pollution des paramètres HTTP
const rateLimit = require('express-rate-limit'); // Pour limiter les requêtes répétées
const cookieParser = require('cookie-parser'); // Pour parser les cookies

// Import des utilitaires et middlewares
const ApiError = require('./utils/ApiError');
const globalErrorHandler = require('./middlewares/errorHandler');
const RESPONSE_MESSAGES = require('./utils/constants/responseMessages');

// Import des routes (exemples, à compléter au fur et à mesure)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
// ... ajoutez d'autres imports de routes

const app = express();

// --- 1. Sécurité : Limiteur de requêtes (contre les attaques de force brute/DDoS) ---
// Limite 100 requêtes par IP toutes les 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par windowMs
    message: RESPONSE_MESSAGES.TOO_MANY_REQUESTS || 'Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes.'
});
app.use(limiter);

// --- 2. Body Parsers ---
// Permet de parser le corps des requêtes en JSON
app.use(express.json({ limit: '10kb' })); // Limite la taille du corps de la requête à 10kb
// Permet de parser les données URL-encoded (formulaires HTML)
app.use(express.urlencoded({ extended: true }));
// Permet de parser les cookies des requêtes
app.use(cookieParser());

// --- 3. Middlewares de Sécurité ---
// Ajoute divers en-têtes HTTP pour sécuriser l'application
app.use(helmet());
// Nettoie les données pour prévenir l'injection de code NoSQL
app.use(mongoSanitize());
// Nettoie les données pour prévenir les attaques XSS
app.use(xss());
// Prévient la pollution des paramètres HTTP (ex: ?sort=price&sort=name)
app.use(hpp({
    whitelist: [ // Liste blanche des paramètres qui peuvent être dupliqués si nécessaire
        // 'duration', 'difficulty', 'price' // Exemple pour une API de tours
    ]
}));

// --- 4. CORS (Cross-Origin Resource Sharing) ---
// Permet aux requêtes provenant d'autres origines (votre frontend) d'accéder à l'API
// En production, il est recommandé de spécifier des origines spécifiques:
// app.use(cors({
//     origin: process.env.FRONTEND_URL, // Ex: 'http://localhost:3000' ou 'https://your-frontend.com'
//     credentials: true // Permet l'envoi de cookies et d'en-têtes d'autorisation
// }));
app.use(cors()); // Pour le développement, autorise toutes les origines

// --- 5. Logging HTTP (Morgan) ---
// 'dev' est un format de log concis et coloré pour le développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- 6. Montage des Routes API ---
// Toutes les routes définies dans ces fichiers seront préfixées par /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
// ... utilisez app.use pour monter toutes vos autres routes

// --- 7. Gestion des routes non trouvées (404 Not Found) ---
// Ce middleware s'exécute si aucune des routes définies précédemment n'a traité la requête.
app.all('*', (req, res, next) => {
    // Crée une instance d'ApiError pour gérer cette situation
    next(new ApiError(`Impossible de trouver ${req.originalUrl} sur ce serveur !`, 404));
});

// --- 8. Middleware de gestion des erreurs global ---
// Ceci est le DERNIER middleware à ajouter à votre chaîne.
// Il intercepte toutes les erreurs passées via `next(err)`.
app.use(globalErrorHandler);

module.exports = app;