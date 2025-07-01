// backend/src/controllers/order/cartController.js
const cartService = require('../../services/cartService'); // Supposons l'existence d'un cartService
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Récupérer le panier de l'utilisateur connecté
 * @route   GET /api/v1/cart
 * @access  Private
 */
exports.getCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const cart = await cartService.getCartByUserId(userId);

    if (!cart) {
        // Si le panier n'existe pas encore pour cet utilisateur, le service pourrait en créer un vide
        // ou vous pouvez décider de renvoyer un panier vide ici.
        return res.status(200).json({
            success: true,
            message: 'Le panier est vide.',
            data: {
                items: [],
                totalPrice: 0,
                totalItems: 0
            },
        });
    }

    res.status(200).json({
        success: true,
        data: cart,
    });
});

/**
 * @desc    Ajouter un produit au panier
 * @route   POST /api/v1/cart
 * @access  Private
 */
exports.addItemToCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return next(new ApiError('L\'ID du produit et une quantité valide sont requis.', 400));
    }

    const updatedCart = await cartService.addItemToCart(userId, productId, quantity);

    res.status(200).json({
        success: true,
        message: 'Produit ajouté au panier.',
        data: updatedCart,
    });
});

/**
 * @desc    Mettre à jour la quantité d'un produit dans le panier
 * @route   PUT /api/v1/cart/:productId
 * @access  Private
 */
exports.updateCartItemQuantity = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return next(new ApiError('Une quantité valide est requise.', 400));
    }

    const updatedCart = await cartService.updateItemQuantity(userId, productId, quantity);

    res.status(200).json({
        success: true,
        message: 'Quantité du produit mise à jour dans le panier.',
        data: updatedCart,
    });
});

/**
 * @desc    Supprimer un produit du panier
 * @route   DELETE /api/v1/cart/:productId
 * @access  Private
 */
exports.removeItemFromCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const updatedCart = await cartService.removeItemFromCart(userId, productId);

    res.status(200).json({
        success: true,
        message: 'Produit retiré du panier.',
        data: updatedCart,
    });
});

/**
 * @desc    Vider complètement le panier
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
exports.clearCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const clearedCart = await cartService.clearCart(userId);

    res.status(200).json({
        success: true,
        message: 'Panier vidé avec succès.',
        data: clearedCart,
    });
});