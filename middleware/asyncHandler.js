// backend/src/middleware/asyncHandler.js
/**
 * Un wrapper pour les fonctions asynchrones des middlewares/contrôleurs.
 * Il attrape toutes les erreurs et les passe au middleware d'erreur global.
 * @param {Function} fn - La fonction asynchrone (middleware ou contrôleur) à envelopper.
 */
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;