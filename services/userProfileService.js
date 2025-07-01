// backend/src/services/userProfileService.js
const User = require('models/User');     // Assurez-vous que le modèle User est défini
const Address = require('../models/Address'); // Assurez-vous que le modèle Address est défini
const ApiError = require('../utils/ApiError');

/**
 * Met à jour les informations de profil de l'utilisateur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {object} updateData - Les données à mettre à jour (nom, email, numéro de téléphone, etc.).
 * @returns {object} L'utilisateur mis à jour.
 */
exports.updateUserProfile = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }

    // Empêcher la mise à jour du rôle ou du mot de passe directement ici
    if (updateData.role) delete updateData.role;
    if (updateData.password) delete updateData.password;
    if (updateData.isEmailVerified) delete updateData.isEmailVerified;

    // Si l'email est mis à jour, il pourrait nécessiter une nouvelle vérification
    if (updateData.email && updateData.email !== user.email) {
        // Optionnel : Gérer la re-vérification de l'email
        // user.isEmailVerified = false;
        // const verificationToken = user.getVerificationToken();
        // await user.save({ validateBeforeSave: false });
        // await emailService.sendVerificationEmail(user.email, verificationToken);
        // throw new ApiError('Email mis à jour. Veuillez vérifier votre nouvel email.', 200); // Ne pas retourner l'erreur, mais un message
    }

    Object.assign(user, updateData);
    await user.save({ runValidators: true });
    return user;
};

/**
 * Gère l'ajout d'une nouvelle adresse pour un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {object} addressData - Les données de la nouvelle adresse.
 * @returns {object} L'adresse créée.
 */
exports.addUserAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }

    const address = await Address.create({ ...addressData, user: userId });

    // Optionnel : Assigner cette adresse comme adresse par défaut si l'utilisateur n'en a pas encore
    if (!user.defaultAddress) {
        user.defaultAddress = address._id;
        await user.save();
    }
    return address;
};

/**
 * Met à jour une adresse existante de l'utilisateur.
 * @param {string} addressId - L'ID de l'adresse à mettre à jour.
 * @param {string} userId - L'ID de l'utilisateur (pour vérifier la propriété).
 * @param {object} updateData - Les données à mettre à jour.
 * @returns {object} L'adresse mise à jour.
 */
exports.updateUserAddress = async (addressId, userId, updateData) => {
    const address = await Address.findOneAndUpdate(
        { _id: addressId, user: userId }, // S'assurer que l'adresse appartient à cet utilisateur
        updateData,
        { new: true, runValidators: true }
    );
    if (!address) {
        throw new ApiError('Adresse non trouvée ou non autorisée.', 404);
    }
    return address;
};

/**
 * Supprime une adresse d'un utilisateur.
 * @param {string} addressId - L'ID de l'adresse à supprimer.
 * @param {string} userId - L'ID de l'utilisateur (pour vérifier la propriété).
 */
exports.deleteUserAddress = async (addressId, userId) => {
    const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
    if (!address) {
        throw new ApiError('Adresse non trouvée ou non autorisée.', 404);
    }

    // Si l'adresse supprimée était l'adresse par défaut, mettre à jour l'utilisateur
    const user = await User.findById(userId);
    if (user && user.defaultAddress && user.defaultAddress.toString() === addressId.toString()) {
        user.defaultAddress = null; // Ou attribuer la prochaine adresse si vous avez cette logique
        await user.save();
    }
    return { message: 'Adresse supprimée avec succès.' };
};

/**
 * Récupère toutes les adresses d'un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Array<object>} Liste des adresses.
 */
exports.getUserAddresses = async (userId) => {
    const addresses = await Address.find({ user: userId });
    return addresses;
};