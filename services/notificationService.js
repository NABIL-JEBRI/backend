// backend/src/services/notificationService.js
const Notification = require('../models/Notification'); // Assurez-vous que le modèle Notification est défini
const ApiError = require('../utils/ApiError');
const emailService = require('./emailService'); // Pour déclencher des emails

/**
 * Crée et enregistre une notification in-app pour un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur destinataire.
 * @param {string} message - Le contenu de la notification.
 * @param {string} type - Le type de notification (ex: 'order', 'promotion', 'system').
 * @param {object} [relatedEntity] - Optionnel: ID et type de l'entité liée (ex: { id: orderId, type: 'Order' }).
 * @param {boolean} [sendEmail=false] - Indique si un email doit être envoyé en plus.
 * @returns {object} La notification créée.
 */
exports.createInAppNotification = async (userId, message, type, relatedEntity = {}, sendEmail = false) => {
    try {
        const notification = await Notification.create({
            user: userId,
            message,
            type,
            relatedEntity
        });

        // Si l'option est activée, envoyer aussi un email
        if (sendEmail) {
            // Dans un vrai cas, vous voudriez récupérer l'email de l'utilisateur via userId
            // et personnaliser le sujet et le contenu de l'email
            const user = await User.findById(userId); // Assurez-vous d'importer le modèle User ici
            if (user && user.email) {
                await emailService.sendEmail({
                    email: user.email,
                    subject: `Nouvelle notification: ${type}`,
                    message: `Bonjour ${user.name},\n\nVous avez une nouvelle notification sur notre marketplace :\n\n${message}\n\nCordialement,\nVotre équipe`
                });
            }
        }
        return notification;
    } catch (error) {
        console.error('Erreur lors de la création de la notification in-app :', error);
        throw new ApiError('Impossible de créer la notification in-app.', 500);
    }
};

/**
 * Récupère les notifications d'un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {object} [filters] - Filtres optionnels (ex: { read: false }).
 * @returns {Array<object>} Liste des notifications.
 */
exports.getNotificationsByUserId = async (userId, filters = {}) => {
    try {
        const notifications = await Notification.find({ user: userId, ...filters })
            .sort({ createdAt: -1 }); // Les plus récentes d'abord
        return notifications;
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications :', error);
        throw new ApiError('Impossible de récupérer les notifications.', 500);
    }
};

/**
 * Marque une notification comme lue.
 * @param {string} notificationId - L'ID de la notification.
 * @param {string} userId - L'ID de l'utilisateur (pour s'assurer que l'utilisateur est le propriétaire).
 * @returns {object} La notification mise à jour.
 */
exports.markNotificationAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true, readAt: Date.now() },
        { new: true } // Retourne le document modifié
    );
    if (!notification) {
        throw new ApiError('Notification non trouvée ou non autorisée.', 404);
    }
    return notification;
};

// ... Ajoutez d'autres fonctions comme deleteNotification, markAllAsRead, etc.