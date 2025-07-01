// backend/src/controllers/product/reviewController.js
const reviewModerationService = require('../../services/reviewModerationService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Créer un nouvel avis pour un produit
 * @route   POST /api/v1/products/:productId/reviews
 * @access  Private (seuls les utilisateurs connectés peuvent laisser un avis)
 */
exports.createReview = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // L'ID de l'utilisateur est supposé venir du middleware d'authentification

    if (!rating || !comment) {
        return next(new ApiError('La note et le commentaire sont requis pour un avis.', 400));
    }
    if (rating < 1 || rating > 5) {
        return next(new ApiError('La note doit être entre 1 et 5.', 400));
    }

    const review = await reviewModerationService.createProductReview(productId, userId, { rating, comment });

    res.status(201).json({
        success: true,
        message: 'Avis soumis avec succès et en attente de modération.',
        data: review,
    });
});

/**
 * @desc    Récupérer tous les avis approuvés pour un produit
 * @route   GET /api/v1/products/:productId/reviews
 * @access  Public
 */
exports.getProductReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // Par défaut, nous récupérons uniquement les avis approuvés pour le public
    const reviews = await reviewModerationService.getProductReviews(productId, true);

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
    });
});

// Note: La mise à jour/suppression d'un avis par son créateur ou la modération des avis
// seront gérées par d'autres contrôleurs (ex: userProfileService pour l'utilisateur,
// et admin/reviewManagementController pour l'admin).