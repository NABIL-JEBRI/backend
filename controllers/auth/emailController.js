// backend/src/controllers/auth/emailController.js
const authService = require('../../services/authService'); // Le service d'authentification pourrait contenir la logique de vérification
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const User = require('models/User'); // Nous avons besoin du modèle User pour la logique de vérification

/**
 * @desc    Vérifier l'email de l'utilisateur
 * @route   GET /api/v1/auth/verifyemail/:token
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        return next(new ApiError('Token de vérification manquant.', 400));
    }

    // Hacher le token pour la comparaison (le token dans la DB est haché)
    const emailVerificationToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        emailVerificationToken,
        emailVerificationExpire: { $gt: Date.now() } // Vérifier que le token n'a pas expiré
    });

    if (!user) {
        return next(new ApiError('Token de vérification invalide ou expiré.', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false }); // Pas besoin de re-valider le mot de passe ici

    res.status(200).json({
        success: true,
        message: 'Email vérifié avec succès. Votre compte est maintenant actif.'
    });
});

/**
 * @desc    Renvoyer l'email de vérification
 * @route   POST /api/v1/auth/resendverification
 * @access  Private (pour les utilisateurs non vérifiés)
 */
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
    // req.user est défini par le middleware d'authentification pour l'utilisateur connecté
    const user = req.user;

    if (!user) {
        return next(new ApiError('Aucun utilisateur connecté pour renvoyer l\'email.', 401));
    }
    if (user.isEmailVerified) {
        return next(new ApiError('Votre email est déjà vérifié.', 400));
    }

    // Générer un nouveau token de vérification
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Envoyer l'email (dépend de votre implémentation dans authService ou emailService)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `Veuillez vérifier votre email en cliquant sur ce lien : \n\n ${verificationUrl}`;

    try {
        const emailService = require('../../services/emailService');
        await emailService.sendEmail({
            email: user.email,
            subject: 'Re-vérifiez votre email pour votre compte',
            message
        });
        res.status(200).json({
            success: true,
            message: 'Un nouvel email de vérification a été envoyé à votre adresse.'
        });
    } catch (err) {
        console.error('Erreur lors du renvoi de l\'email de vérification :', err);
        user.emailVerificationToken = undefined; // Nettoyer en cas d'échec d'envoi
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ApiError('Erreur lors du renvoi de l\'email de vérification. Veuillez réessayer plus tard.', 500));
    }
});