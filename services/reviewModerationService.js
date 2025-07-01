// backend/src/services/reviewModerationService.js
const Review = require('../models/Review'); // Assurez-vous que le modèle Review est défini
const Product = require('../models/Product'); // Pour mettre à jour la note moyenne du produit
const User = require('models/User'); // Pour récupérer des détails si besoin (reviewer, seller)
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService'); // Pour notifier l'utilisateur ou le vendeur

/**
 * Crée un nouvel avis sur un produit.
 * @param {string} productId - L'ID du produit évalué.
 * @param {string} userId - L'ID de l'utilisateur qui laisse l'avis.
 * @param {object} reviewData - Données de l'avis (rating, comment).
 * @returns {object} L'avis créé.
 */
exports.createProductReview = async (productId, userId, reviewData) => {
    const { rating, comment } = reviewData;

    // 1. Vérifier si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError('Produit non trouvé.', 404);
    }

    // 2. Vérifier si l'utilisateur a déjà laissé un avis pour ce produit (optionnel, selon vos règles)
    const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
    if (alreadyReviewed) {
        throw new ApiError('Vous avez déjà soumis un avis pour ce produit.', 400);
    }

    // 3. Créer l'avis
    const review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment,
        isApproved: false // Les avis nécessitent une approbation par défaut
    });

    // 4. Notifier l'administrateur ou le vendeur qu'un nouvel avis est en attente
    // Vous pourriez avoir une fonction spécifique pour les notifications admin/seller
    await notificationService.createInAppNotification(
        // Remplacez 'adminId' par l'ID réel d'un admin ou d'un groupe d'admins
        'adminIdPlaceholder', // Cet ID doit être remplacé par un ID d'administrateur valide
        `Nouvel avis en attente pour le produit "${product.name}".`,
        'review_pending_approval',
        { id: review._id, type: 'Review', product: product._id }
    );

    return review;
};

/**
 * Récupère tous les avis pour un produit donné.
 * @param {string} productId - L'ID du produit.
 * @param {boolean} [onlyApproved=true] - N'afficher que les avis approuvés.
 * @returns {Array<object>} Liste des avis.
 */
exports.getProductReviews = async (productId, onlyApproved = true) => {
    const query = { product: productId };
    if (onlyApproved) {
        query.isApproved = true;
    }
    const reviews = await Review.find(query).populate('user', 'name profilePicture'); // Peupler l'utilisateur qui a laissé l'avis
    return reviews;
};

/**
 * Récupère les avis en attente de modération (pour les administrateurs).
 * @returns {Array<object>} Liste des avis en attente.
 */
exports.getPendingReviews = async () => {
    const reviews = await Review.find({ isApproved: false })
        .populate('product', 'name images')
        .populate('user', 'name email');
    return reviews;
};

/**
 * Approuve un avis. Met à jour la note moyenne du produit.
 * @param {string} reviewId - L'ID de l'avis.
 * @param {string} adminId - L'ID de l'administrateur qui approuve.
 * @returns {object} L'avis approuvé.
 */
exports.approveReview = async (reviewId, adminId) => {
    const review = await Review.findById(reviewId).populate('product');
    if (!review) {
        throw new ApiError('Avis non trouvé.', 404);
    }
    if (review.isApproved) {
        throw new ApiError('Cet avis est déjà approuvé.', 400);
    }

    review.isApproved = true;
    review.approvedAt = Date.now();
    review.approvedBy = adminId;
    await review.save();

    // Mettre à jour la note moyenne du produit
    await exports.calculateAndUpdateProductRating(review.product._id);

    // Notifier l'utilisateur que son avis a été approuvé
    await notificationService.createInAppNotification(
        review.user,
        `Votre avis pour le produit "${review.product.name}" a été approuvé et est maintenant visible !`,
        'review_approved',
        { id: review._id, type: 'Review', product: review.product._id },
        true // Envoyer un email
    );

    return review;
};

/**
 * Rejette ou supprime un avis.
 * @param {string} reviewId - L'ID de l'avis.
 * @param {string} adminId - L'ID de l'administrateur qui rejette/supprime.
 * @param {string} [reason] - Raison du rejet (optionnel).
 */
exports.rejectReview = async (reviewId, adminId, reason = 'Contenu inapproprié ou non pertinent.') => {
    const review = await Review.findById(reviewId).populate('product');
    if (!review) {
        throw new ApiError('Avis non trouvé.', 404);
    }

    // Enregistrer le rejet (vous pourriez avoir un champ `rejectionReason` dans le modèle Review)
    // Ou simplement le supprimer si le rejet est équivalent à une suppression
    await review.deleteOne(); // Utiliser deleteOne() sur l'instance du document pour les hooks

    // Si l'avis était déjà approuvé, recalculer la note moyenne
    if (review.isApproved && review.product) {
        await exports.calculateAndUpdateProductRating(review.product._id);
    }

    // Notifier l'utilisateur que son avis a été rejeté/supprimé
    await notificationService.createInAppNotification(
        review.user,
        `Votre avis pour le produit "${review.product.name}" a été rejeté/supprimé. Raison : ${reason}`,
        'review_rejected',
        { id: review._id, type: 'Review', product: review.product._id },
        true // Envoyer un email
    );

    return { message: 'Avis rejeté/supprimé avec succès.' };
};

/**
 * Calcule et met à jour la note moyenne et le nombre d'avis pour un produit.
 * Cette fonction est appelée après l'ajout, l'approbation ou la suppression d'un avis.
 * @param {string} productId - L'ID du produit.
 */
exports.calculateAndUpdateProductRating = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        // Cela ne devrait pas arriver si appelé après un avis valide
        return;
    }

    const stats = await Review.aggregate([
        { $match: { product: product._id, isApproved: true } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }
    ]);

    product.ratings = stats.length > 0 ? stats[0].avgRating : 0;
    product.numOfReviews = stats.length > 0 ? stats[0].numOfReviews : 0;

    await product.save({ validateBeforeSave: false }); // Ne pas valider le reste du produit
};

// Vous pouvez ajouter des fonctions pour signaler un avis, etc.