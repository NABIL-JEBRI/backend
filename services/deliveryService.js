// backend/src/services/deliveryService.js
const Delivery = require('../models/Delivery'); // Assurez-vous que le modèle Delivery est défini
const Order = require('../models/Order');     // Pour lier à la commande
const ApiError = require('../utils/ApiError');

/**
 * Crée une nouvelle livraison pour une commande donnée.
 * @param {string} orderId - L'ID de la commande associée.
 * @param {object} deliveryDetails - Détails de la livraison (adresse, méthode, etc.).
 * @returns {object} L'objet Delivery créé.
 */
exports.createDelivery = async (orderId, deliveryDetails) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Commande non trouvée pour créer la livraison.', 404);
    }

    // Générer un numéro de suivi unique (vous pouvez utiliser un package comme `uuid` ou une logique simple)
    const trackingNumber = `DEL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const delivery = await Delivery.create({
        order: orderId,
        trackingNumber,
        deliveryAddress: deliveryDetails.address, // Assurez-vous que cette structure correspond à votre modèle
        deliveryMethod: deliveryDetails.method,
        estimatedDeliveryDate: deliveryDetails.estimatedDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Ex: 5 jours plus tard
        status: 'pending' // Statut initial
        // ... autres champs nécessaires
    });

    // Mettre à jour la commande pour y inclure l'ID de la livraison
    order.delivery = delivery._id;
    await order.save();

    return delivery;
};

/**
 * Met à jour le statut d'une livraison.
 * @param {string} deliveryId - ID de la livraison.
 * @param {string} newStatus - Nouveau statut (ex: 'shipped', 'out_for_delivery', 'delivered').
 */
exports.updateDeliveryStatus = async (deliveryId, newStatus) => {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
        throw new ApiError('Livraison non trouvée.', 404);
    }

    delivery.status = newStatus;
    if (newStatus === 'delivered') {
        delivery.deliveryDate = Date.now();
    }
    await delivery.save();
    return delivery;
};

/**
 * Récupère les détails d'une livraison par son numéro de suivi.
 * @param {string} trackingNumber - Le numéro de suivi de la livraison.
 */
exports.getDeliveryByTrackingNumber = async (trackingNumber) => {
    const delivery = await Delivery.findOne({ trackingNumber }).populate('order');
    if (!delivery) {
        throw new ApiError('Livraison non trouvée pour ce numéro de suivi.', 404);
    }
    return delivery;
};

/**
 * Récupère les livraisons d'un utilisateur donné.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Array<object>} Liste des livraisons.
 */
exports.getUserDeliveries = async (userId) => {
    // Cela nécessite que le modèle Order ait une référence à l'utilisateur
    const orders = await Order.find({ user: userId }).select('_id');
    const orderIds = orders.map(order => order._id);
    const deliveries = await Delivery.find({ order: { $in: orderIds } }).populate('order');
    return deliveries;
};

// Ajoutez des fonctions pour l'assignation des livreurs, etc. si pertinent
/*
exports.assignDeliveryToDriver = async (deliveryId, driverId) => {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
        throw new ApiError('Livraison non trouvée.', 404);
    }
    delivery.assignedDriver = driverId;
    delivery.status = 'assigned';
    await delivery.save();
    return delivery;
};
*/