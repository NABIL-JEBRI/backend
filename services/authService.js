// backend/src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('/models/User'); // Assurez-vous que le modèle User est déjà défini
const ApiError = require('../utils/ApiError'); // Votre classe d'erreur personnalisée
const emailService = require('./emailService'); // Nous l'importerons ici (à créer juste après)

/**
 * Enregistre un nouvel utilisateur.
 * @param {object} userData - Données de l'utilisateur (nom, email, mot de passe).
 * @returns {object} L'utilisateur créé et le token JWT.
 */
exports.registerUser = async (userData) => {
    const { name, email, password } = userData;

    // 1. Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError('Un utilisateur avec cet email existe déjà', 400);
    }

    // 2. Créer l'utilisateur
    const user = await User.create({
        name,
        email,
        password, // Le hachage sera fait dans le modèle User via un hook pre-save
        role: 'client' // Rôle par défaut
    });

    // 3. Générer un token de vérification d'email (si vous implémentez la vérification d'email)
    // const verificationToken = user.getVerificationToken();
    // await user.save({ validateBeforeSave: false }); // Sauvegarder le token sans valider le reste

    // 4. Envoyer un email de bienvenue ou de vérification
    // await emailService.sendVerificationEmail(user.email, verificationToken); // À implémenter dans emailService

    // 5. Générer le token JWT pour la connexion automatique après inscription
    const token = user.getSignedJwtToken(); // Fonction définie dans le modèle User

    return { user, token };
};

/**
 * Connecte un utilisateur existant.
 * @param {string} email - Email de l'utilisateur.
 * @param {string} password - Mot de passe de l'utilisateur.
 * @returns {object} L'utilisateur et le token JWT.
 */
exports.loginUser = async (email, password) => {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password'); // Sélectionner le mot de passe explicitement

    if (!user) {
        throw new ApiError('Identifiants invalides : Email ou mot de passe incorrect', 401);
    }

    // 2. Vérifier le mot de passe
    const isMatch = await user.matchPassword(password); // Fonction définie dans le modèle User

    if (!isMatch) {
        throw new ApiError('Identifiants invalides : Email ou mot de passe incorrect', 401);
    }

    // 3. (Optionnel) Vérifier si l'email est vérifié
    // if (!user.isEmailVerified) {
    //     throw new ApiError('Votre compte n\'est pas vérifié. Veuillez vérifier votre email.', 401);
    // }

    // 4. Générer le token JWT
    const token = user.getSignedJwtToken();

    return { user, token };
};

/**
 * Gère la demande de mot de passe oublié.
 * @param {string} email - Email de l'utilisateur.
 */
exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        // Ne pas révéler si l'email existe pour des raisons de sécurité
        throw new ApiError('Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.', 200);
    }

    // Générer un token de réinitialisation de mot de passe
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Sauvegarder le token et son expiration

    // Créer l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Envoyer l'email
    const message = `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte. Veuillez cliquer sur ce lien pour réinitialiser votre mot de passe : \n\n ${resetUrl} \n\n Ce lien expirera dans 10 minutes. Si vous n'avez pas demandé cela, veuillez ignorer cet email.`;

    try {
        await emailService.sendEmail({
            email: user.email,
            subject: 'Réinitialisation de mot de passe pour votre compte',
            message
        });
        return { message: 'Email de réinitialisation de mot de passe envoyé avec succès.' };
    } catch (err) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation :', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError('Erreur lors de l\'envoi de l\'email de réinitialisation', 500);
    }
};

/**
 * Réinitialise le mot de passe de l'utilisateur.
 * @param {string} token - Token de réinitialisation reçu par email.
 * @param {string} newPassword - Le nouveau mot de passe.
 */
exports.resetPassword = async (token, newPassword) => {
    // Hacher le token pour la comparaison (le token dans la DB est haché)
    const resetPasswordToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } // Vérifier que le token n'a pas expiré
    });

    if (!user) {
        throw new ApiError('Token de réinitialisation invalide ou expiré', 400);
    }

    // Définir le nouveau mot de passe
    user.password = newPassword; // Le hachage sera fait dans le modèle User via un hook pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès.' };
};

// ... autres fonctions d'authentification si nécessaires (ex: verifyEmail)