// backend/src/controllers/auth/passwordController.js
const authService = require('../../services/authService');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Demander la réinitialisation du mot de passe (envoi d'email)
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ApiError('Veuillez fournir l\'adresse email pour la réinitialisation.', 400));
    }

    // Le service gère la génération du token et l'envoi de l'email
    await authService.forgotPassword(email);

    res.status(200).json({
        success: true,
        message: 'Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.'
    });
});

/**
 * @desc    Réinitialiser le mot de passe avec le token reçu par email
 * @route   PUT /api/v1/auth/resetpassword/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return next(new ApiError('Token et nouveau mot de passe sont requis.', 400));
    }

    // Le service gère la validation du token et la mise à jour du mot de passe
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès.'
    });
});