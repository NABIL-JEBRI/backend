// backend/src/controllers/auth/authController.js
const userService = require('../../services/userService');
const {
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require('../../utils/validators/userValidator');
const { validate } = require('../../utils/validators/commonValidator'); // Middleware de validation Joi
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const generateAuthToken = require('../../utils/security/tokenGenerator'); // Assurez-vous d'avoir ce fichier

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
    // Valider les données de la requête avec Joi
    const { error, value } = registerUserSchema.validate(req.body);
    if (error) {
        // Transforme les erreurs Joi en un format lisible pour ApiError
        const errors = error.details.map(detail => detail.message);
        return next(new ApiError(errors.join(', '), 400));
    }

    const newUser = await userService.registerUser(value);

    // Générer un token JWT et l'envoyer
    const token = generateAuthToken(newUser._id);

    res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        token,
        user: {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role
        }
    });
});

/**
 * @desc    Log in user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    // Valider les données de la requête avec Joi
    const { error, value } = loginUserSchema.validate(req.body);
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return next(new ApiError(errors.join(', '), 400));
    }

    const { email, password } = value;

    const user = await userService.loginUser(email, password);

    // Générer un token JWT et l'envoyer
    const token = generateAuthToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * @desc    Log user out / clear cookie
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res, next) => {
    // Côté backend, il suffit de renvoyer une réponse indiquant le succès.
    // La suppression du token se fera côté client (suppression du localStorage/cookies).
    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    // req.user est populé par le middleware d'authentification (protect)
    const user = await userService.getUserById(req.user.id); // Utilisez un service pour obtenir l'utilisateur complet

    if (!user) {
        return next(new ApiError('User not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Update user password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
    // Valider les données de la requête avec Joi
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return next(new ApiError(errors.join(', '), 400));
    }

    const { currentPassword, newPassword } = value;

    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
        success: true,
        message: 'Password updated successfully.'
    });
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Valider les données de la requête avec Joi
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return next(new ApiError(errors.join(', '), 400));
    }

    const { email } = value;

    // Le service va générer le token et envoyer l'email
    await userService.sendPasswordResetEmail(email);

    res.status(200).json({
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
    });
});

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
    // Le token vient des paramètres d'URL, le nouveau mot de passe du corps
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    // Valider les données avec Joi (incluant le token dans le schéma du body pour uniformité)
    const { error, value } = resetPasswordSchema.validate({ token, newPassword, confirmNewPassword });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return next(new ApiError(errors.join(', '), 400));
    }

    await userService.resetUserPassword(value.token, value.newPassword);

    res.status(200).json({
        success: true,
        message: 'Password reset successfully.'
    });
});