// backend/src/controllers/order/orderController.js
const orderService = require('../../services/orderService'); // Supposons l'existence d'un orderService pour la création
const orderProcessingService = require('../../services/orderProcessingService'); // Pour les mises à jour de statut/retour
const cartService = require('../../services/cartService'); // Pour interagir avec le panier après commande
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Créer une nouvelle commande
 * @route   POST /api/v1/orders
 * @access  Private (uniquement pour les utilisateurs connectés)
 */
exports.createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // ID de l'utilisateur connecté
    const {
        cartItems,        // Tableau d'objets { productId, quantity }
        shippingAddress,  // ID ou objet complet de l'adresse de livraison
        paymentMethod,    // Ex: 'Credit Card', 'Cash on Delivery', 'Stripe'
        deliveryMethod,   // Ex: 'Home Delivery', 'Relay Point'
        relayPointId,     // Optionnel, si deliveryMethod est 'Relay Point'
        paymentDetails    // Détails de paiement (ex: token Stripe, si applicable)
    } = req.body;

    // Validation des données d'entrée
    if (!cartItems || cartItems.length === 0) {
        return next(new ApiError('Le panier ne peut pas être vide pour créer une commande.', 400));
    }
    if (!shippingAddress && deliveryMethod !== 'Relay Point') {
        return next(new ApiError('L\'adresse de livraison est requise pour une livraison à domicile.', 400));
    }
    if (deliveryMethod === 'Relay Point' && !relayPointId) {
        return next(new ApiError('L\'ID du point relais est requis pour une livraison en point relais.', 400));
    }
    if (!paymentMethod) {
        return next(new ApiError('La méthode de paiement est requise.', 400));
    }

    // Le service orderService gérera toute la logique complexe:
    // - Récupérer les détails des produits et calculer le total
    // - Vérifier la disponibilité des stocks (via inventoryService)
    // - Traiter le paiement (via paymentService ou cashOnDeliveryService)
    // - Créer l'enregistrement de la commande
    // - Décrémenter les stocks
    // - Vider le panier de l'utilisateur (via cartService si le panier est persistant)
    const order = await orderService.createOrder({
        userId,
        cartItems,
        shippingAddress,
        paymentMethod,
        deliveryMethod,
        relayPointId,
        paymentDetails
    });

    res.status(201).json({
        success: true,
        message: 'Commande créée avec succès.',
        data: order,
    });
});

/**
 * @desc    Récupérer les commandes d'un utilisateur connecté
 * @route   GET /api/v1/orders/my
 * @access  Private
 */
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Le service pourrait offrir des options de filtrage ou de pagination
    const orders = await orderService.getOrdersByUserId(userId, req.query);

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
});

/**
 * @desc    Récupérer une commande spécifique par son ID (pour l'utilisateur propriétaire)
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
exports.getOrderById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await orderService.getOrderById(id);

    if (!order) {
        return next(new ApiError('Commande non trouvée.', 404));
    }

    // S'assurer que l'utilisateur est le propriétaire de la commande
    if (order.user.toString() !== userId.toString()) {
        return next(new ApiError('Non autorisé à accéder à cette commande.', 403));
    }

    res.status(200).json({
        success: true,
        data: order,
    });
});

/**
 * @desc    Annuler une commande (si le statut le permet)
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; // Utilisateur qui tente d'annuler

    // La logique d'annulation, y compris la vérification des permissions et le retour en stock,
    // sera gérée par orderProcessingService.
    const updatedOrder = await orderProcessingService.updateOrderStatus(id, 'cancelled', userId);

    res.status(200).json({
        success: true,
        message: 'Commande annulée avec succès.',
        data: updatedOrder,
    });
});

/**
 * @desc    Demander un retour pour des articles d'une commande
 * @route   POST /api/v1/orders/:id/return
 * @access  Private
 */
exports.requestReturn = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Order ID
    const { itemsToReturn, reason } = req.body;
    const userId = req.user.id;

    if (!itemsToReturn || !Array.isArray(itemsToReturn) || itemsToReturn.length === 0) {
        return next(new ApiError('Veuillez spécifier les articles à retourner.', 400));
    }

    const result = await orderProcessingService.handleReturn(id, itemsToReturn, userId, reason);

    res.status(200).json({
        success: true,
        message: 'Demande de retour traitée.',
        data: result.order, // Retourne la commande mise à jour
    });
});