// backend/src/jobs/deliveryJobs.js
const cron = require('node-cron');
const Delivery = require('../models/deliveryModel'); // Assurez-vous d'avoir ce modèle
const DELIVERY_STATUS = require('../utils/constants/deliveryStatus');
const emailService = require('../services/emailService'); // Pour les notifications
const User = require('../models/userModel'); // Pour trouver les livreurs ou clients

/**
 * @desc Planifie les rappels aux livreurs pour les livraisons en attente de prise en charge.
 * S'exécute toutes les heures.
 */
exports.schedulePickupReminders = () => {
    cron.schedule('0 * * * *', async () => { // Toutes les heures
        console.log('Running scheduled task: Sending pickup reminders to delivery personnel...');
        try {
            const deliveries = await Delivery.find({
                status: DELIVERY_STATUS.PENDING_PICKUP,
                // Assurez-vous que la date de pickup est proche ou passée
                scheduledPickupTime: { $lt: new Date(Date.now() + 30 * 60 * 1000) } // Dans les 30 prochaines minutes ou déjà passée
            }).populate('assignedTo', 'email firstName'); // Populer le livreur assigné

            if (deliveries.length > 0) {
                for (const delivery of deliveries) {
                    if (delivery.assignedTo && delivery.assignedTo.email) {
                        try {
                            await emailService.sendEmail({
                                to: delivery.assignedTo.email,
                                subject: `Rappel: Prise en charge de livraison #${delivery._id}`,
                                templateName: 'deliveryPickupReminder',
                                templateData: {
                                    deliveryId: delivery._id,
                                    pickupAddress: delivery.pickupAddress, // Supposons que ces champs existent
                                    scheduledTime: delivery.scheduledPickupTime
                                }
                            });
                            console.log(`Pickup reminder sent for delivery ${delivery._id} to ${delivery.assignedTo.email}`);
                        } catch (emailError) {
                            console.error(`Failed to send pickup reminder for ${delivery._id} to ${delivery.assignedTo.email}:`, emailError);
                        }
                    }
                }
                console.log(`${deliveries.length} pickup reminders processed.`);
            } else {
                console.log('No deliveries pending pickup for reminders.');
            }
        } catch (error) {
            console.error('Error scheduling pickup reminders:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};

/**
 * @desc Planifie la détection et la notification des tentatives de livraison échouées.
 * S'exécute plusieurs fois par jour (ex: toutes les 6 heures).
 */
exports.scheduleFailedDeliveryNotifications = () => {
    cron.schedule('0 */6 * * *', async () => { // Toutes les 6 heures
        console.log('Running scheduled task: Checking for failed delivery attempts...');
        try {
            const failedDeliveries = await Delivery.find({
                status: DELIVERY_STATUS.FAILED_ATTEMPT,
                lastAttemptedAt: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) } // Tentative dans les 6 dernières heures
            }).populate('customer', 'email firstName'); // Populer le client

            if (failedDeliveries.length > 0) {
                for (const delivery of failedDeliveries) {
                    if (delivery.customer && delivery.customer.email) {
                        try {
                            await emailService.sendEmail({
                                to: delivery.customer.email,
                                subject: `Tentative de livraison échouée pour votre commande #${delivery.orderId}`,
                                templateName: 'failedDeliveryNotification',
                                templateData: {
                                    customerName: delivery.customer.firstName,
                                    deliveryId: delivery._id,
                                    // Inclure des instructions pour reprogrammer
                                    rescheduleLink: `${process.env.FRONTEND_URL}/account/delivery/${delivery._id}/reschedule`
                                }
                            });
                            // Optionnel: Mettre à jour un flag pour ne pas renvoyer le même email trop souvent
                            console.log(`Failed delivery notification sent for ${delivery._id} to ${delivery.customer.email}`);
                        } catch (emailError) {
                            console.error(`Failed to send failed delivery notification for ${delivery._id} to ${delivery.customer.email}:`, emailError);
                        }
                    }
                }
                console.log(`${failedDeliveries.length} failed delivery notifications processed.`);
            } else {
                console.log('No new failed delivery attempts to notify.');
            }
        } catch (error) {
            console.error('Error scheduling failed delivery notifications:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};