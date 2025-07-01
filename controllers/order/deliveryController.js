// backend/src/controllers/order/deliveryController.js
const deliveryService = require('../../services/deliveryService');
const userProfileService = require('../../services/userProfileService'); // Pour obtenir les adresses de l'utilisateur
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Obtenir les options de livraison disponibles pour une commande (ou un panier)
 * Basé sur l'adresse de l'utilisateur, le poids/volume du panier, etc.
 * @route   GET /api/v1/orders/delivery-options
 * @access  Private (pour les utilisateurs connectés)
 *
 * Cette route pourrait être appelée avant de finaliser une commande pour montrer au client
 * les méthodes de livraison et les coûts associés.
 */
exports.getDeliveryOptions = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    // Potentiellement, passer l'ID du panier ou les items du panier si la logique de prix/poids
    // est complexe et dépend des articles.
    const { cartId, destinationAddressId } = req.query; // Ou directement req.body si POST

    if (!destinationAddressId) {
        return next(new ApiError('Un ID d\'adresse de destination est requis pour obtenir les options de livraison.', 400));
    }

    // Récupérer les détails de l'adresse de destination de l'utilisateur
    const userAddresses = await userProfileService.getUserAddresses(userId);
    const destinationAddress = userAddresses.find(addr => addr._id.toString() === destinationAddressId);

    if (!destinationAddress) {
        return next(new ApiError('Adresse de destination introuvable pour cet utilisateur.', 404));
    }

    // Le service de livraison calculera les options et les coûts.
    // Cela pourrait inclure des vérifications de distance, de poids, de type de produit, etc.
    const deliveryOptions = await deliveryService.calculateDeliveryOptions(
        userId,
        destinationAddress,
        cartId // Passer le panier si nécessaire pour le calcul des frais
    );

    res.status(200).json({
        success: true,
        data: deliveryOptions,
    });
});

/**
 * @desc    Sélectionner un créneau de livraison spécifique (si applicable)
 * @route   POST /api/v1/orders/delivery-slot
 * @access  Private
 *
 * Cette route serait utilisée si votre système permet aux clients de choisir une date/heure spécifique.
 */
exports.selectDeliverySlot = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { orderId, preferredSlotId, preferredDate } = req.body;

    if (!orderId || (!preferredSlotId && !preferredDate)) {
        return next(new ApiError('L\'ID de la commande et un créneau ou une date préférée sont requis.', 400));
    }

    // Le service validera le créneau et l'assignera à la commande.
    // Cela pourrait impliquer de vérifier la disponibilité du créneau.
    const updatedOrder = await deliveryService.assignDeliverySlotToOrder(
        orderId,
        userId,
        preferredSlotId,
        preferredDate
    );

    res.status(200).json({
        success: true,
        message: 'Créneau de livraison sélectionné avec succès.',
        data: updatedOrder,
    });
});

// Note: D'autres fonctions pourraient inclure:
// - getRelayPointsNearAddress: Pour trouver les points relais à proximité de l'utilisateur
//   (bien que cela puisse aussi être dans relayPointController dans controllers/delivery/)