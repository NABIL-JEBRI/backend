// backend/src/jobs/emailJobs.js
const cron = require('node-cron');
const emailService = require('../services/emailService'); // Assurez-vous d'avoir ce service
const User = require('../models/userModel'); // Pour récupérer les utilisateurs pour les rappels

/**
 * @desc Planifie l'envoi d'e-mails de bienvenue aux nouveaux utilisateurs.
 * S'exécute toutes les 5 minutes pour traiter les utilisateurs marqués comme 'welcomeEmailSent: false'.
 */
exports.scheduleWelcomeEmails = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running scheduled task: Checking for users to send welcome emails...');
        try {
            // Récupérer les utilisateurs qui n'ont pas encore reçu l'email de bienvenue
            const newUsers = await User.find({ welcomeEmailSent: false });

            for (const user of newUsers) {
                try {
                    await emailService.sendEmail({
                        to: user.email,
                        subject: 'Bienvenue sur votre Marketplace !',
                        templateName: 'welcomeEmail', // Nom du template d'email
                        templateData: { userName: user.firstName }
                    });
                    // Marquer l'utilisateur comme ayant reçu l'email pour éviter les doublons
                    user.welcomeEmailSent = true;
                    await user.save({ validateBeforeSave: false }); // Sauvegarder sans valider tout le document
                    console.log(`Welcome email sent to ${user.email}`);
                } catch (emailError) {
                    console.error(`Failed to send welcome email to ${user.email}:`, emailError);
                    // Gérer l'échec de l'envoi, peut-être réessayer plus tard ou alerter
                }
            }
            if (newUsers.length === 0) {
                console.log('No new users found for welcome emails.');
            }
        } catch (error) {
            console.error('Error scheduling welcome emails:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production', // N'exécuter qu'en production par défaut
        timezone: "Europe/Paris" // Ajustez à votre fuseau horaire
    });
};

/**
 * @desc Planifie l'envoi de rappels de panier abandonné.
 * S'exécute une fois par jour (par exemple, à 2h du matin).
 */
exports.scheduleAbandonedCartReminders = () => {
    cron.schedule('0 2 * * *', async () => { // Tous les jours à 02:00
        console.log('Running scheduled task: Sending abandoned cart reminders...');
        try {
            // Logique pour trouver les paniers abandonnés
            // Cela nécessiterait un modèle `Cart` ou une logique dans le modèle `User`
            // const abandonedCarts = await Cart.find({ lastUpdated: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, status: 'abandoned' });

            // Exemple fictif: récupérer des utilisateurs qui pourraient avoir des paniers
            const usersWithPotentialCarts = await User.find({ /* critères pour les paniers abandonnés */ });

            for (const user of usersWithPotentialCarts) {
                // Logique pour vérifier si user a un panier abandonné et quand le dernier rappel a été envoyé
                const hasAbandonedCart = true; // Remplacez par votre logique réelle
                const lastReminderSent = null; // Remplacez par votre logique réelle

                if (hasAbandonedCart && !lastReminderSent || (Date.now() - lastReminderSent > 7 * 24 * 60 * 60 * 1000)) { // Si pas de rappel ou plus d'une semaine
                     try {
                        await emailService.sendEmail({
                            to: user.email,
                            subject: 'N\'oubliez pas votre panier sur notre Marketplace !',
                            templateName: 'abandonedCartReminder',
                            templateData: { userName: user.firstName, cartUrl: `${process.env.FRONTEND_URL}/cart` }
                        });
                        // Mettre à jour l'utilisateur/panier avec la date du dernier rappel
                        // user.lastCartReminderSent = new Date();
                        // await user.save({ validateBeforeSave: false });
                        console.log(`Abandoned cart reminder sent to ${user.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send abandoned cart reminder to ${user.email}:`, emailError);
                    }
                }
            }
            if (usersWithPotentialCarts.length === 0) {
                 console.log('No abandoned carts found for reminders.');
            }
        } catch (error) {
            console.error('Error sending abandoned cart reminders:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};