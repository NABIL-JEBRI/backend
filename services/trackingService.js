// backend/src/services/trackingService.js
const Order = require('../models/Order');     // Assurez-vous que le modèle Order est défini
const Delivery = require('../models/Delivery'); // Assurez-vous que le modèle Delivery est défini
const ApiError = require('../utils/ApiError');

/**
 * Récupère le statut de suivi d'une commande ou d'une livraison par son numéro de suivi.
 * @param {string} trackingNumber - Le numéro de suivi (peut être celui d'une commande ou d'une livraison).
 * @returns {object} Les informations de suivi.
 */
exports.getTrackingStatus = async (trackingNumber) => {
    // Tenter de trouver par numéro de suivi de commande
    let entity = await Order.findOne({ 'tracking.trackingNumber': trackingNumber })
                            .populate('delivery')
                            .populate('items.product', 'name images');

    if (!entity) {
        // Si ce n'est pas une commande, tenter de trouver par numéro de suivi de livraison
        entity = await Delivery.findOne({ trackingNumber: trackingNumber })
                               .populate({
                                   path: 'order',
                                   populate: { path: 'items.product', select: 'name images' }
                               });
    }

    if (!entity) {
        throw new ApiError('Aucune commande ou livraison trouvée avec ce numéro de suivi.', 404);
    }

    // Préparer une réponse générique pour le suivi
    const trackingInfo = {
        trackingNumber: entity.trackingNumber || (entity.order ? entity.order.tracking.trackingNumber : 'N/A'),
        type: entity.deliveryAddress ? 'delivery' : 'order',
        currentStatus: entity.status,
        lastUpdate: entity.updatedAt,
        history: [], // Vous pourriez stocker un tableau d'événements de suivi dans vos modèles
    };

    // Si c'est une livraison, ajouter des détails spécifiques
    if (entity.deliveryAddress) {
        trackingInfo.deliveryDetails = {
            address: entity.deliveryAddress,
            method: entity.deliveryMethod,
            estimatedDeliveryDate: entity.estimatedDeliveryDate,
            driver: entity.assignedDriver ? entity.assignedDriver.name : 'Non assigné' // Populer le livreur si vous avez un modèle Driver
        };
    }
    // Si c'est une commande, ajouter des détails spécifiques
    if (entity.items && entity.items.length > 0) {
        trackingInfo.orderDetails = {
            orderId: entity._id,
            totalAmount: entity.totalAmount,
            items: entity.items.map(item => ({
                productName: item.product.name,
                quantity: item.quantity,
                image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null
            })),
            user: entity.user ? entity.user.name : 'Invité' // Populer l'utilisateur si vous avez un modèle User
        };
    }

    return trackingInfo;
};

/**
 * Génère un nouveau numéro de suivi unique.
 * Peut être appelé lors de la création d'une commande ou d'une livraison.
 * @param {string} prefix - Préfixe pour le numéro de suivi (ex: 'ORD', 'DEL').
 * @returns {string} Un numéro de suivi unique.
 */
exports.generateUniqueTrackingNumber = (prefix = 'TRACK') => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6 chiffres aléatoires
    return `${prefix}-${timestamp}-${randomSuffix}`;
};

// Vous pourriez ajouter des fonctions pour enregistrer l'historique des événements de suivi
/*
exports.addTrackingEvent = async (deliveryId, eventDetails) => {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
        throw new ApiError('Livraison non trouvée.', 404);
    }
    delivery.trackingHistory.push({
        status: eventDetails.status,
        location: eventDetails.location,
        timestamp: Date.now(),
        description: eventDetails.description
    });
    await delivery.save();
    return delivery;
};
*/