// backend/src/jobs/orderJobs.js
const cron = require('node-cron');
const Order = require('../models/orderModel'); // Assurez-vous d'avoir ce modèle
const ORDER_STATUS = require('../utils/constants/orderStatus');

/**
 * @desc Planifie la mise à jour des statuts de commande 'en attente' après un certain délai.
 * Par exemple, marquer les commandes non payées comme 'failed' ou 'cancelled' après 24h.
 * S'exécute toutes les 30 minutes.
 */
exports.schedulePendingOrderCleanup = () => {
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running scheduled task: Cleaning up pending orders...');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const pendingOrders = await Order.find({
                status: ORDER_STATUS.PENDING,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            if (pendingOrders.length > 0) {
                for (const order of pendingOrders) {
                    order.status = ORDER_STATUS.FAILED; // Ou CANCELLED
                    // Vous pouvez également ajouter une raison de l'échec/annulation
                    await order.save();
                    console.log(`Order ${order._id} changed from PENDING to FAILED due to timeout.`);
                }
                console.log(`${pendingOrders.length} pending orders updated.`);
            } else {
                console.log('No old pending orders to update.');
            }
        } catch (error) {
            console.error('Error cleaning up pending orders:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};

/**
 * @desc Planifie la finalisation des commandes livrées après un certain délai (ex: 7 jours).
 * Utile pour marquer les commandes comme 'COMPLETED' après que le client ait eu le temps de signaler des problèmes.
 * S'exécute une fois par jour.
 */
exports.scheduleDeliveredOrderCompletion = () => {
    cron.schedule('0 0 * * *', async () => { // Tous les jours à minuit
        console.log('Running scheduled task: Completing delivered orders...');
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentlyDeliveredOrders = await Order.find({
                status: ORDER_STATUS.DELIVERED,
                updatedAt: { $lt: sevenDaysAgo } // Basé sur la dernière mise à jour (date de livraison)
            });

            if (recentlyDeliveredOrders.length > 0) {
                for (const order of recentlyDeliveredOrders) {
                    order.status = ORDER_STATUS.COMPLETED;
                    await order.save();
                    console.log(`Order ${order._id} moved from DELIVERED to COMPLETED.`);
                    // Optionnel: Envoyer un email de demande d'avis au client
                }
                console.log(`${recentlyDeliveredOrders.length} delivered orders marked as completed.`);
            } else {
                console.log('No delivered orders ready for completion.');
            }
        } catch (error) {
            console.error('Error completing delivered orders:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};