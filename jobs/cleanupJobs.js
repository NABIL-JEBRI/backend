// backend/src/jobs/cleanupJobs.js
const cron = require('node-cron');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
// ... importez d'autres modèles nécessitant un nettoyage

/**
 * @desc Planifie la suppression des tokens de réinitialisation de mot de passe expirés.
 * S'exécute toutes les heures.
 */
exports.scheduleExpiredPasswordResetTokenCleanup = () => {
    cron.schedule('0 * * * *', async () => { // Toutes les heures
        console.log('Running scheduled task: Cleaning up expired password reset tokens...');
        try {
            const result = await User.updateMany(
                { passwordResetExpires: { $lt: Date.now() } }, // Où le token a expiré
                { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } } // Supprime les champs
            );
            console.log(`Cleaned up ${result.modifiedCount} expired password reset tokens.`);
        } catch (error) {
            console.error('Error cleaning up expired password reset tokens:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};

/**
 * @desc Planifie la suppression des sessions ou des données temporaires obsolètes.
 * Par exemple, des paniers abandonnés très anciens ou des logs de débogage.
 * S'exécute une fois par semaine.
 */
exports.scheduleOldDataCleanup = () => {
    cron.schedule('0 0 * * 0', async () => { // Chaque dimanche à minuit
        console.log('Running scheduled task: Cleaning up old data...');
        try {
            // Exemple: Supprimer les commandes "FAILED" ou "CANCELLED" de plus d'un an
            const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            const deletedOrdersResult = await Order.deleteMany({
                status: { $in: ['failed', 'cancelled'] }, // Assurez-vous d'utiliser les vraies constantes d'ORDER_STATUS
                createdAt: { $lt: oneYearAgo }
            });
            console.log(`Deleted ${deletedOrdersResult.deletedCount} old failed/cancelled orders.`);

            // Exemple: Anonymiser ou supprimer des comptes utilisateurs inactifs (dépend de votre politique RGPD)
            // const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
            // const inactiveUsersResult = await User.updateMany(
            //     { lastLogin: { $lt: threeYearsAgo }, role: 'customer' },
            //     { email: 'anon_user_' + Math.random().toString(36).substring(2, 10) + '@example.com', firstName: 'Anonymous', lastName: 'User', isActive: false }
            // );
            // console.log(`Anonymized ${inactiveUsersResult.modifiedCount} old inactive users.`);

            // Add more cleanup tasks here for other models/data

            console.log('Old data cleanup task completed.');
        } catch (error) {
            console.error('Error during old data cleanup:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};