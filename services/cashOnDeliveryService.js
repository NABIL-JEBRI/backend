// backend/src/services/cashOnDeliveryService.js
const Order = require('../models/Order');     // Assurez-vous que le modèle Order est défini
const Delivery = require('../models/Delivery'); // Pour la liaison avec la livraison
const ApiError = require('../utils/ApiError');

/**
 * Confirme le paiement en espèces pour une commande livrée.
 * Cette fonction serait appelée par un livreur ou un administrateur après réception du paiement.
 * @param {string} orderId - ID de la commande.
 * @param {string} [paidBy='cash'] - Méthode de paiement confirmée.
 * @param {string} [confirmedByUserId] - ID de l'utilisateur qui confirme le paiement (livreur/admin).
 * @returns {object} La commande mise à jour.
 */
exports.confirmCashPayment = async (orderId, paidBy = 'cash', confirmedByUserId = null) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError('Commande non trouvée.', 404);
    }

    if (order.paymentMethod !== 'cash_on_delivery') {
        throw new ApiError('Cette commande n\'est pas réglable en espèces à la livraison.', 400);
    }
    if (order.isPaid) {
        throw new ApiError('Cette commande a déjà été payée.', 400);
    }

    // Optionnel: Vérifier le statut de livraison si le paiement COD est conditionné par la livraison effective
    const delivery = await Delivery.findOne({ order: orderId });
    if (delivery && delivery.status !== 'delivered') {
        throw new ApiError('La commande doit être livrée avant de confirmer le paiement en espèces.', 400);
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
        id: `COD-${orderId}-${Date.now()}`, // ID de transaction interne pour COD
        status: 'completed',
        update_time: Date.now(),
        email_address: order.user ? (await require('models/User').findById(order.user)).email : 'guest', // Récupère l'email si utilisateur connecté
        paidBy: paidBy,
        confirmedBy: confirmedByUserId
    };

    await order.save();
    return order;
};

/**
 * Récupère toutes les commandes en attente de paiement COD (pour les livreurs/admins).
 * @returns {Array<object>} Liste des commandes en attente de paiement COD.
 */
exports.getPendingCashOnDeliveryOrders = async () => {
    const orders = await Order.find({
        paymentMethod: 'cash_on_delivery',
        isPaid: false,
        status: { $in: ['shipped', 'out_for_delivery', 'delivered'] } // Commandes qui ont progressé jusqu'à la livraison
    }).populate('user', 'name email').populate('delivery');
    return orders;
};

// Vous pouvez ajouter d'autres fonctions pour la gestion des incidents COD, etc.