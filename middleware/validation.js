// backend/src/middleware/validation.js
const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * Middleware de validation des données d'entrée.
 * Utilise Joi pour valider le corps, les paramètres ou les requêtes.
 * @param {object} schema - Le schéma Joi pour la validation.
 */
exports.validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    // `allowUnknown: true` permet d'ignorer les champs non définis dans le schéma mais présents dans le corps de la requête.
    // `abortEarly: false` permet de collecter toutes les erreurs de validation, pas seulement la première.

    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return next(new ApiError(`Erreur de validation : ${errorMessage}`, 400));
    }
    next();
};

// --- Exemples de schémas Joi (Ces schémas iraient probablement dans un dossier `utils/validationSchemas.js` ou par contrôleur) ---

// const registerSchema = Joi.object({
//     name: Joi.string().min(3).max(50).required(),
//     email: Joi.string().email().required(),
//     password: Joi.string().min(6).required(),
//     // ... autres champs
// });

// const productSchema = Joi.object({
//     name: Joi.string().min(3).max(100).required(),
//     price: Joi.number().min(0).required(),
//     description: Joi.string().max(1000),
//     // ... autres champs
// });

// Comment l'utiliser dans une route :
// router.post('/register', validate(registerSchema), authController.register);
// router.post('/products', protect, authorize('seller'), validate(productSchema), productController.createProduct);