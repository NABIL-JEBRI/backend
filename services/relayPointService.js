// backend/src/services/relayPointService.js
const RelayPoint = require('../models/RelayPoint'); // Assurez-vous que le modèle RelayPoint est défini
const ApiError = require('../utils/ApiError');

/**
 * Récupère tous les points relais disponibles.
 * Peut inclure des filtres par gouvernorat, délégation, etc.
 * @param {object} filters - Filtres de recherche (ex: { governorate: 'Sousse' }).
 * @returns {Array<object>} Liste des points relais.
 */
exports.getAllRelayPoints = async (filters = {}) => {
    try {
        const query = {};
        if (filters.governorate) {
            query.governorate = new RegExp(filters.governorate, 'i'); // Recherche insensible à la casse
        }
        if (filters.delegation) {
            query.delegation = new RegExp(filters.delegation, 'i');
        }
        if (filters.search) {
            query.$or = [
                { name: new RegExp(filters.search, 'i') },
                { address: new RegExp(filters.search, 'i') },
            ];
        }

        const relayPoints = await RelayPoint.find(query);
        return relayPoints;
    } catch (error) {
        console.error('Erreur lors de la récupération des points relais :', error);
        throw new ApiError('Impossible de récupérer les points relais.', 500);
    }
};

/**
 * Récupère un point relais par son ID.
 * @param {string} relayPointId - ID du point relais.
 * @returns {object} Le point relais.
 */
exports.getRelayPointById = async (relayPointId) => {
    const relayPoint = await RelayPoint.findById(relayPointId);
    if (!relayPoint) {
        throw new ApiError('Point relais non trouvé.', 404);
    }
    return relayPoint;
};

/**
 * Crée un nouveau point relais (généralement par un administrateur).
 * @param {object} relayPointData - Données du point relais.
 * @returns {object} Le point relais créé.
 */
exports.createRelayPoint = async (relayPointData) => {
    const { name, address, governorate, delegation, phone } = relayPointData;

    // Optionnel: Vérifier l'existence pour éviter les doublons par nom/adresse
    const existingRelayPoint = await RelayPoint.findOne({ name, address });
    if (existingRelayPoint) {
        throw new ApiError('Un point relais avec ce nom et adresse existe déjà.', 400);
    }

    const relayPoint = await RelayPoint.create(relayPointData);
    return relayPoint;
};

/**
 * Met à jour un point relais existant.
 * @param {string} relayPointId - ID du point relais à mettre à jour.
 * @param {object} updateData - Données à mettre à jour.
 * @returns {object} Le point relais mis à jour.
 */
exports.updateRelayPoint = async (relayPointId, updateData) => {
    const relayPoint = await RelayPoint.findByIdAndUpdate(relayPointId, updateData, { new: true, runValidators: true });
    if (!relayPoint) {
        throw new ApiError('Point relais non trouvé.', 404);
    }
    return relayPoint;
};

/**
 * Supprime un point relais.
 * @param {string} relayPointId - ID du point relais à supprimer.
 */
exports.deleteRelayPoint = async (relayPointId) => {
    const relayPoint = await RelayPoint.findByIdAndDelete(relayPointId);
    if (!relayPoint) {
        throw new ApiError('Point relais non trouvé.', 404);
    }
    return { message: 'Point relais supprimé avec succès.' };
};