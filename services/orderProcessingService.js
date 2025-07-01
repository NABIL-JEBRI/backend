// backend/src/services/orderProcessingService.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const inventoryService = require('./inventoryService'); // Pour gérer le stock
const paymentService = require('./paymentService');     // Pour gérer les remboursements
const notificationService = require('./notificationService'); // Pour notifier
const ApiError = require('../utils/ApiError');

/**
 * Met à jour le statut d'une commande.
 * Peut déclencher des notifications ou des actions d'inventaire.
 * @param {string} orderId - ID de la commande.
 * @param {string} newStatus - Le nouveau statut de la commande.
 * @param {string} [updaterId] - ID de l'utilisateur qui effectue la mise à jour (admin, seller, driver).
 * @returns {object} La commande mise à jour.
 */
exports.updateOrderStatus = async (orderId, newStatus, updaterId = null) => {
    const order = await Order.findById(orderId).populate('user', 'email name');
    if (!order) {
        throw new ApiError('Commande non trouvée.', 404);
    }

    // Logique de transition d'état (ex: ne pas passer de 'delivered' à 'pending')
    // Vous pouvez implémenter une machine d'état ici ou des if/else simples
    if (order.status === 'completed' && newStatus !== 'refunded' && newStatus !== 'cancelled') {
         // Exemple: une commande complétée ne peut être que remboursée ou annulée (avec conditions)
         throw new ApiError(`La commande est déjà au statut final (${order.status}). Impossible de passer à ${newStatus}.`, 400);
    }
    // Ajoutez d'autres logiques de validation d'état si nécessaire

    order.status = newStatus;
    // Enregistrer l'historique des statuts si votre modèle Order a ce champ
    // order.statusHistory.push({ status: newStatus, timestamp: Date.now(), updatedBy: updaterId });

    await order.save();

    // Déclencher des actions basées sur le nouveau statut
    if (newStatus === 'cancelled') {
        // Incrémenter le stock si la commande est annulée
        for (const item of order.items) {
            await inventoryService.incrementProductStock(item.product, item.quantity);
        }
        await notificationService.createInAppNotification(
            order.user._id,
            `Votre commande #${order.orderNumber} a été annulée.`,
            'order_cancelled',
            { id: order._id, type: 'Order' },
            true // Envoyer un email
        );
    } else if (newStatus === 'completed') {
        // Envoyer une notification de commande complétée
        await notificationService.createInAppNotification(
            order.user._id,
            `Votre commande #${order.orderNumber} a été livrée et complétée !`,
            'order_completed',
            { id: order._id, type: 'Order' },
            true // Envoyer un email
        );
    }
    // ... autres logiques pour 'shipped', 'out_for_delivery', etc.

    return order;
};

/**
 * Gère le processus de retour d'un ou plusieurs articles d'une commande.
 * @param {string} orderId - ID de la commande.
 * @param {Array<object>} itemsToReturn - Tableau d'objets { productId, quantity, reason }.
 * @param {string} userId - ID de l'utilisateur effectuant le retour.
 * @returns {object} La commande mise à jour et un message de succès.
 */
exports.handleReturn = async (orderId, itemsToReturn, userId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError('Commande non trouvée.', 404);
    }
    // Assurez-vous que l'utilisateur est le propriétaire de la commande ou un administrateur
    if (order.user.toString() !== userId.toString() && !(await User.findById(userId)).role.includes('admin')) {
         throw new ApiError('Vous n\'êtes pas autorisé à gérer cette commande.', 403);
    }

    const returnedItemsInfo = [];
    let totalRefundAmount = 0;

    for (const itemToReturn of itemsToReturn) {
        const orderItem = order.items.find(item => item.product.toString() === itemToReturn.productId.toString());

        if (!orderItem) {
            throw new ApiError(`L'article (produit ID: ${itemToReturn.productId}) n'a pas été trouvé dans cette commande.`, 404);
        }
        if (orderItem.returnedQuantity + itemToReturn.quantity > orderItem.quantity) {
            throw new ApiError(`Quantité de retour invalide pour le produit ${orderItem.name}.`, 400);
        }

        // Marquer l'article comme retourné dans la commande
        orderItem.returnedQuantity = (orderItem.returnedQuantity || 0) + itemToReturn.quantity;
        // Mettre à jour l'inventaire
        await inventoryService.incrementProductStock(orderItem.product, itemToReturn.quantity);

        // Calculer le montant du remboursement pour cet article
        const itemRefundAmount = orderItem.price * itemToReturn.quantity;
        totalRefundAmount += itemRefundAmount;
        returnedItemsInfo.push({
            productId: itemToReturn.productId,
            quantity: itemToReturn.quantity,
            amount: itemRefundAmount
        });
    }

    // Mettre à jour le statut global de la commande si tous les articles sont retournés, ou un statut partiel
    const allItemsReturned = order.items.every(item => item.returnedQuantity === item.quantity);
    if (allItemsReturned) {
        order.status = 'returned';
    } else if (returnedItemsInfo.length > 0) {
        order.status = 'partially_returned';
    }

    await order.save();

    // Initier le remboursement via le service de paiement
    if (totalRefundAmount > 0) {
        await paymentService.initiateRefund(order.paymentResult.id, totalRefundAmount); // Assurez-vous que paymentResult.id est l'ID de transaction externe
        await notificationService.createInAppNotification(
            order.user._id,
            `Un remboursement de ${totalRefundAmount} TND a été initié pour votre commande #${order.orderNumber}.`,
            'refund_initiated',
            { id: order._id, type: 'Order' },
            true
        );
    }

    return { order, message: 'Retour traité avec succès.' };
};