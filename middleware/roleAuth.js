// backend/src/middleware/roleAuth.js
const ApiError = require('../utils/ApiError');

/**
 * Middleware pour autoriser l'accès en fonction des rôles.
 * @param  {...string} roles - Les rôles autorisés pour cette route (ex: 'admin', 'seller').
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            // Cela ne devrait normalement pas arriver si 'protect' est utilisé avant
            return next(new ApiError('Accès interdit : Rôle utilisateur non défini', 403));
        }
        // Vérifier si le rôle de l'utilisateur est inclus dans les rôles autorisés
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(`Accès interdit : Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource.`, 403));
        }
        next();
    };
};