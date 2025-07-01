// backend/src/services/promotionService.js
const Promotion = require('../models/Promotion'); // Assurez-vous que le modèle Promotion est défini
const ApiError = require('../utils/ApiError');

/**
 * Crée une nouvelle promotion.
 * @param {object} promotionData - Données de la promotion (code, type, valeur, dates, etc.).
 * @returns {object} La promotion créée.
 */
exports.createPromotion = async (promotionData) => {
    const { code, startDate, endDate } = promotionData;

    // Vérifier si un code promo avec le même nom existe déjà (s'il est unique)
    if (code) {
        const existingPromotion = await Promotion.findOne({ code });
        if (existingPromotion) {
            throw new ApiError('Un code promotionnel avec ce nom existe déjà.', 400);
        }
    }

    // Valider les dates
    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError('La date de début doit être antérieure à la date de fin.', 400);
    }

    const promotion = await Promotion.create(promotionData);
    return promotion;
};

/**
 * Met à jour une promotion existante.
 * @param {string} promotionId - ID de la promotion à mettre à jour.
 * @param {object} updateData - Données à mettre à jour.
 * @returns {object} La promotion mise à jour.
 */
exports.updatePromotion = async (promotionId, updateData) => {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
        throw new ApiError('Promotion non trouvée.', 404);
    }

    // Vérifier les dates si elles sont mises à jour
    if (updateData.startDate && updateData.endDate && new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new ApiError('La date de début doit être antérieure à la date de fin.', 400);
    } else if (updateData.startDate && !updateData.endDate && new Date(updateData.startDate) >= promotion.endDate) {
        throw new ApiError('La nouvelle date de début doit être antérieure à la date de fin actuelle.', 400);
    } else if (updateData.endDate && !updateData.startDate && promotion.startDate >= new Date(updateData.endDate)) {
        throw new ApiError('La nouvelle date de fin doit être postérieure à la date de début actuelle.', 400);
    }

    Object.assign(promotion, updateData);
    await promotion.save();
    return promotion;
};

/**
 * Supprime une promotion.
 * @param {string} promotionId - ID de la promotion à supprimer.
 */
exports.deletePromotion = async (promotionId) => {
    const promotion = await Promotion.findByIdAndDelete(promotionId);
    if (!promotion) {
        throw new ApiError('Promotion non trouvée.', 404);
    }
    return { message: 'Promotion supprimée avec succès.' };
};

/**
 * Applique une promotion à un prix donné.
 * @param {number} originalPrice - Le prix original.
 * @param {string} promotionCode - Le code de la promotion à appliquer.
 * @returns {number} Le prix après application de la promotion.
 */
exports.applyPromotion = async (originalPrice, promotionCode) => {
    const promotion = await Promotion.findOne({ code: promotionCode });

    if (!promotion) {
        throw new ApiError('Code promotionnel invalide.', 400);
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
        throw new ApiError('Ce code promotionnel n\'est pas actif actuellement.', 400);
    }
    if (!promotion.isActive) {
        throw new ApiError('Ce code promotionnel est inactif.', 400);
    }
    // Ajoutez d'autres vérifications (utilisation unique par utilisateur, limite d'utilisation globale, min/max spend)

    let discountedPrice = originalPrice;
    if (promotion.type === 'percentage') {
        discountedPrice = originalPrice * (1 - promotion.value / 100);
    } else if (promotion.type === 'fixed') {
        discountedPrice = originalPrice - promotion.value;
    }

    return Math.max(0, discountedPrice); // S'assurer que le prix ne soit pas négatif
};

/**
 * Récupère toutes les promotions actives.
 * @returns {Array<object>} Liste des promotions actives.
 */
exports.getActivePromotions = async () => {
    const now = new Date();
    const promotions = await Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    });
    return promotions;
};