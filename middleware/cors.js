// backend/src/middleware/cors.js
const cors = require('cors');

// Configuration de base de CORS
// Par défaut, permet toutes les requêtes cross-origin.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*', // Limitez à votre frontend en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Autorise l'envoi de cookies d'authentification
    optionsSuccessStatus: 204 // Pour les requêtes OPTION
};

exports.corsMiddleware = cors(corsOptions);

// Comment l'utiliser :
// Dans backend/src/app.js :
// const { corsMiddleware } = require('./middleware/cors');
// app.use(corsMiddleware);