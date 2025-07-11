// backend/server.js
const dotenv = require('dotenv'); // Pour charger les variables d'environnement
const app = require('./app');   // Votre application Express configurée
const connectDB = require('./config/database'); // Votre fonction de connexion à la DB

// Import des jobs planifiés (cron jobs)
// const emailJobs = require('./jobs/emailJobs');
// const orderJobs = require('./jobs/orderJobs');
// const deliveryJobs = require('./jobs/deliveryJobs');
// const cleanupJobs = require('./jobs/cleanupJobs');
// const analyticsJobs = require('./jobs/analyticsJobs');

// --- 1. Gestion des exceptions non gérées (synchrones) ---
// Cela attrape les erreurs qui se produisent en dehors des blocs try-catch
// et qui ne sont pas des promesses rejetées. C'est crucial pour la robustesse.
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // Exit the process immediately after logging
    process.exit(1);
});

// --- 2. Chargement des variables d'environnement ---
// Doit être fait le plus tôt possible
dotenv.config();

// --- 3. Connexion à la base de données ---
connectDB();

// --- 4. Initialisation des Jobs planifiés (Cron Jobs) ---
// Ces jobs ne s'exécuteront que si leur option 'scheduled' est 'true' (souvent en production)
// et si leurs dépendances (modèles, services) sont correctement configurées.
console.log('Initializing cron jobs...');
// emailJobs.scheduleWelcomeEmails();
// emailJobs.scheduleAbandonedCartReminders();
// orderJobs.schedulePendingOrderCleanup();
// orderJobs.scheduleDeliveredOrderCompletion();
// deliveryJobs.schedulePickupReminders();
// deliveryJobs.scheduleFailedDeliveryNotifications();
// cleanupJobs.scheduleExpiredPasswordResetTokenCleanup();
// cleanupJobs.scheduleOldDataCleanup();
// analyticsJobs.scheduleDailyAnalyticsReport();
// analyticsJobs.scheduleMonthlyPerformanceReport();
console.log('Cron jobs initialized.');

// --- 5. Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// --- 6. Gestion des rejets de promesses non gérées (asynchrones) ---
// Attrape les erreurs des promesses qui ne sont pas gérées par un .catch()
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // Ferme le serveur gracieusement avant de quitter le processus
    server.close(() => {
        process.exit(1);
    });
});

// Gérer l'arrêt propre de l'application (ex: Ctrl+C)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully.');
    server.close(() => {
        console.log('Process terminated!');
    });
});