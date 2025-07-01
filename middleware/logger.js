// backend/src/middleware/logger.js
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Créez un stream pour les logs d'accès dans un fichier
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../../access.log'), // Chemin vers le fichier de log (hors du dossier src)
    { flags: 'a' } // 'a' pour ajouter au fichier existant
);

// Configuration du logger (morgan)
exports.httpLogger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: process.env.NODE_ENV === 'production' ? accessLogStream : process.stdout // En production, écrire dans le fichier; sinon, dans la console
});

// Comment l'utiliser :
// Dans backend/src/app.js :
// const { httpLogger } = require('./middleware/logger');
// app.use(httpLogger);