// backend/src/services/sellerManagementService.js
const User = require('models/User'); // Le modèle User doit avoir un champ 'role' et 'sellerStatus' (ex: 'pending', 'approved', 'rejected', 'suspended')
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService'); // Pour notifier le vendeur

/**
 * Récupère toutes les demandes de vendeurs en attente d'approbation.
 * @returns {Array<object>} Liste des utilisateurs ayant le rôle 'seller' et le statut 'pending'.
 */
exports.getPendingSellerApplications = async () => {
    const pendingSellers = await User.find({ role: 'seller', sellerStatus: 'pending' });
    return pendingSellers;
};

/**
 * Approuve un utilisateur pour devenir un vendeur.
 * Met à jour son rôle et son statut de vendeur.
 * @param {string} userId - L'ID de l'utilisateur à approuver.
 * @param {string} adminId - L'ID de l'administrateur qui approuve.
 * @returns {object} L'utilisateur mis à jour.
 */
exports.approveSeller = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    if (user.role !== 'client' && user.role !== 'seller') { // S'assurer qu'il n'est pas déjà admin, etc.
        throw new ApiError(`Impossible d'approuver un utilisateur avec le rôle actuel "${user.role}" comme vendeur.`, 400);
    }
    if (user.sellerStatus === 'approved') {
        throw new ApiError('Cet utilisateur est déjà un vendeur approuvé.', 400);
    }

    user.role = 'seller'; // S'assurer que le rôle est bien 'seller'
    user.sellerStatus = 'approved';
    user.approvedBy = adminId;
    user.approvedAt = Date.now();
    await user.save();

    // Notifier le nouvel utilisateur vendeur
    await notificationService.createInAppNotification(
        user._id,
        'Félicitations ! Votre demande de vendeur a été approuvée. Vous pouvez maintenant commencer à vendre vos produits !',
        'seller_approved',
        {},
        true // Envoyer un email
    );

    return user;
};

/**
 * Rejette une demande de vendeur ou dégrade un vendeur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} adminId - L'ID de l'administrateur qui rejette/dégrade.
 * @param {string} [reason] - Raison du rejet/de la dégradation.
 * @returns {object} L'utilisateur mis à jour.
 */
exports.rejectOrDemoteSeller = async (userId, adminId, reason = 'Raison non spécifiée.') => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    if (user.role === 'admin') { // Empêcher la dégradation des admins
        throw new ApiError('Impossible de dégrader un administrateur.', 403);
    }
    if (user.sellerStatus === 'pending') {
        user.sellerStatus = 'rejected';
    } else if (user.sellerStatus === 'approved' || user.sellerStatus === 'suspended') {
        user.role = 'client'; // Revertir le rôle à 'client'
        user.sellerStatus = 'rejected';
    }
    user.rejectionReason = reason; // Ajouter un champ pour la raison de rejet/dégradation
    user.rejectedBy = adminId;
    user.rejectedAt = Date.now();
    await user.save();

    await notificationService.createInAppNotification(
        user._id,
        `Votre statut de vendeur a été mis à jour. Raison : ${reason}`,
        'seller_status_updated',
        {},
        true
    );

    return user;
};

/**
 * Suspend temporairement un compte vendeur.
 * @param {string} userId - L'ID du vendeur à suspendre.
 * @param {string} adminId - L'ID de l'administrateur qui suspend.
 * @param {string} [reason] - Raison de la suspension.
 * @returns {object} L'utilisateur mis à jour.
 */
exports.suspendSeller = async (userId, adminId, reason = 'Violation des conditions de service.') => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    if (user.role !== 'seller') {
        throw new ApiError('Seuls les utilisateurs avec le rôle "seller" peuvent être suspendus.', 400);
    }
    if (user.sellerStatus === 'suspended') {
        throw new ApiError('Ce compte vendeur est déjà suspendu.', 400);
    }

    user.sellerStatus = 'suspended';
    user.suspensionReason = reason;
    user.suspendedBy = adminId;
    user.suspendedAt = Date.now();
    await user.save();

    await notificationService.createInAppNotification(
        user._id,
        `Votre compte vendeur a été suspendu. Raison : ${reason}. Veuillez contacter le support.`,
        'seller_suspended',
        {},
        true
    );

    return user;
};

/**
 * Réactive un compte vendeur suspendu.
 * @param {string} userId - L'ID du vendeur à réactiver.
 * @param {string} adminId - L'ID de l'administrateur qui réactive.
 * @returns {object} L'utilisateur mis à jour.
 */
exports.reactivateSeller = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    if (user.sellerStatus !== 'suspended') {
        throw new ApiError('Ce compte vendeur n\'est pas suspendu.', 400);
    }

    user.sellerStatus = 'approved'; // Revenir au statut 'approved'
    user.suspensionReason = undefined; // Supprimer la raison de suspension
    user.suspendedBy = undefined;
    user.suspendedAt = undefined;
    await user.save();

    await notificationService.createInAppNotification(
        user._id,
        'Votre compte vendeur a été réactivé. Vous pouvez de nouveau vendre vos produits.',
        'seller_reactivated',
        {},
        true
    );

    return user;
};