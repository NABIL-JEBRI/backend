// backend/src/services/uploadService.js
const cloudinary = require('cloudinary').v2;
const ApiError = require('../utils/ApiError');

// S'assurer que Cloudinary est configuré (normalement fait dans le middleware upload.js ou globalement dans app.js)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Supprime une image de Cloudinary.
 * @param {string} publicId - L'ID public de l'image sur Cloudinary.
 */
exports.deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok') {
            throw new ApiError(`Échec de la suppression de l'image sur Cloudinary : ${result.result}`, 500);
        }
        return { success: true, message: 'Image supprimée avec succès.' };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image Cloudinary :', error);
        throw new ApiError('Erreur serveur lors de la suppression de l\'image', 500);
    }
};

/**
 * Récupère l'URL d'une image avec des transformations spécifiques.
 * @param {string} publicId - L'ID public de l'image.
 * @param {object} transformations - Objet des transformations Cloudinary (ex: { width: 100, height: 100, crop: "fill" }).
 * @returns {string} L'URL de l'image transformée.
 */
exports.getTransformedImageUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, transformations);
};

// ... Ajoutez d'autres fonctions si vous avez des besoins spécifiques avec Cloudinary