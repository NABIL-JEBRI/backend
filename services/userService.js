// backend/src/services/userService.js
const User = require('../models/User'); // Assurez-vous d'avoir ce modèle
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/security/encryption'); // Pour le hachage des mots de passe
const generatePasswordResetToken = require('../utils/security/tokenGenerator'); // Pour le token de réinitialisation (hashage)
const emailService = require('./emailService'); // Service pour l'envoi d'e-mails
const { isValidObjectId } = require('../utils/validators/commonValidator'); // Pour valider les ObjectId

/**
 * @desc Enregistre un nouvel utilisateur dans la base de données.
 * @param {object} userData - Les données de l'utilisateur (firstName, lastName, email, password, role).
 * @returns {Promise<User>} L'objet utilisateur créé, sans le mot de passe.
 * @throws {ApiError} Si l'email existe déjà.
 */
exports.registerUser = async (userData) => {
    const { email, password } = userData;

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError('Un utilisateur avec cet email existe déjà.', 400);
    }

    // 2. Hacher le mot de passe avant de le sauvegarder
    const hashedPassword = await hashPassword(password);
    userData.password = hashedPassword;

    // 3. Créer l'utilisateur
    const newUser = await User.create(userData);

    // Retourner l'utilisateur sans les champs sensibles
    return newUser.toObject({
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    });
};

/**
 * @desc Authentifie un utilisateur en vérifiant ses identifiants.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} plainPassword - Le mot de passe en texte clair fourni par l'utilisateur.
 * @returns {Promise<User>} L'objet utilisateur authentifié, sans le mot de passe.
 * @throws {ApiError} Si les identifiants sont invalides.
 */
exports.loginUser = async (email, plainPassword) => {
    // 1. Récupérer l'utilisateur par email, incluant le mot de passe (qui est select: false par défaut)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new ApiError('Identifiants invalides.', 401);
    }

    // 2. Comparer le mot de passe fourni avec le mot de passe haché stocké
    const isMatch = await comparePassword(plainPassword, user.password);

    if (!isMatch) {
        throw new ApiError('Identifiants invalides.', 401);
    }

    // Retourner l'utilisateur sans les champs sensibles
    return user.toObject({
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    });
};

/**
 * @desc Récupère un utilisateur par son ID.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Promise<User>} L'objet utilisateur, sans le mot de passe.
 * @throws {ApiError} Si l'ID est invalide ou si l'utilisateur n'est pas trouvé.
 */
exports.getUserById = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw new ApiError('Format d\'ID utilisateur invalide.', 400);
    }
    // Exclure explicitement les champs sensibles
    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    return user;
};

/**
 * @desc Met à jour le mot de passe d'un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur qui change son mot de passe.
 * @param {string} currentPassword - Le mot de passe actuel de l'utilisateur.
 * @param {string} newPassword - Le nouveau mot de passe de l'utilisateur.
 * @throws {ApiError} Si l'utilisateur n'est pas trouvé, si le mot de passe actuel est incorrect, ou si le nouveau mot de passe est identique à l'ancien.
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
    if (!isValidObjectId(userId)) {
        throw new ApiError('Format d\'ID utilisateur invalide.', 400);
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }

    // 1. Vérifier le mot de passe actuel
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError('Le mot de passe actuel est incorrect.', 401);
    }

    // 2. Vérifier que le nouveau mot de passe n'est pas le même que l'ancien
    const isNewPasswordSame = await comparePassword(newPassword, user.password);
    if (isNewPasswordSame) {
        throw new ApiError('Le nouveau mot de passe ne peut pas être le même que l\'ancien.', 400);
    }

    // 3. Hacher le nouveau mot de passe et sauvegarder
    user.password = await hashPassword(newPassword);
    await user.save(); // Les validateurs de Mongoose s'exécuteront ici
};

/**
 * @desc Envoie un email de réinitialisation de mot de passe à l'utilisateur.
 * @param {string} email - L'email de l'utilisateur.
 * @throws {ApiError} En cas d'erreur lors de l'envoi de l'email.
 */
exports.sendPasswordResetEmail = async (email) => {
    const user = await User.findOne({ email });

    // Pour des raisons de sécurité, nous ne révélons pas si l'email existe ou non.
    // L'attaquant ne doit pas savoir si un compte est associé à cet email.
    if (!user) {
        console.log(`Tentative de réinitialisation de mot de passe pour un email non enregistré: ${email}`);
        // Nous renvoyons une réussite pour éviter d'informer les acteurs malveillants.
        return;
    }

    // 1. Générer un token de réinitialisation (cette méthode est définie dans userModel.js)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Sauvegarder sans valider tout le document (car on modifie des champs non-obligatoires)

    // 2. Construire l'URL de réinitialisation
    // Assurez-vous que process.env.FRONTEND_URL est bien configuré dans votre fichier .env
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 3. Préparer et envoyer l'email
    try {
        await emailService.sendEmail({
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe pour votre Marketplace',
            templateName: 'passwordReset', // Nom du template d'email (si vous utilisez des templates)
            templateData: {
                userFirstName: user.firstName,
                resetURL
            }
        });
    } catch (err) {
        // En cas d'échec d'envoi d'email, annuler la création du token sur l'utilisateur
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}:`, err);
        throw new ApiError('Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation. Veuillez réessayer plus tard.', 500);
    }
};

/**
 * @desc Réinitialise le mot de passe d'un utilisateur en utilisant un token.
 * @param {string} token - Le token de réinitialisation reçu par email.
 * @param {string} newPassword - Le nouveau mot de passe.
 * @throws {ApiError} Si le token est invalide ou a expiré.
 */
exports.resetUserPassword = async (token, newPassword) => {
    // 1. Hacher le token reçu pour le comparer avec celui stocké dans la DB (qui est déjà haché)
    // Assurez-vous que votre fonction generatePasswordResetToken peut hacher un token brut pour comparaison
    const hashedToken = generatePasswordResetToken(token, true); // `true` indique de hacher pour comparaison

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } // Vérifier que le token n'a pas expiré
    });

    if (!user) {
        throw new ApiError('Le jeton de réinitialisation du mot de passe est invalide ou a expiré.', 400);
    }

    // 2. Mettre à jour le mot de passe de l'utilisateur
    user.password = await hashPassword(newPassword);
    // Effacer les champs du token après utilisation
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // Les validateurs du modèle s'exécuteront
};

/**
 * @desc Récupère tous les utilisateurs (pour usage admin).
 * @param {object} query - Paramètres de requête pour le filtrage, la pagination et le tri.
 * @returns {Promise<{users: User[], pagination: object}>} Une liste d'utilisateurs et les informations de pagination.
 */
exports.getAllUsers = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.role) {
        filter.role = query.role;
    }
    if (query.email) {
        filter.email = { $regex: query.email, $options: 'i' }; // Recherche insensible à la casse
    }
    if (query.search) {
        filter.$or = [
            { firstName: { $regex: query.search, $options: 'i' } },
            { lastName: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } }
        ];
    }

    const sort = {};
    if (query.sortBy) {
        const [field, order] = query.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1; // Tri par défaut
    }

    const users = await User.find(filter)
        .select('-password -__v') // Exclure les champs sensibles
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return {
        users,
        pagination: {
            total: totalUsers,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

/**
 * @desc Met à jour les détails d'un utilisateur (pour usage admin ou profil propre).
 * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
 * @param {object} updateData - Les données à mettre à jour.
 * @returns {Promise<User>} L'objet utilisateur mis à jour, sans le mot de passe.
 * @throws {ApiError} Si l'ID est invalide ou si l'utilisateur n'est pas trouvé.
 */
exports.updateUser = async (userId, updateData) => {
    if (!isValidObjectId(userId)) {
        throw new ApiError('Format d\'ID utilisateur invalide.', 400);
    }

    // Empêcher la mise à jour directe du mot de passe via cette route sans vérification
    if (updateData.password) {
        delete updateData.password;
    }

    // Empêcher la modification du rôle par l'utilisateur lui-même (seul l'admin peut)
    // Cela dépend de votre logique métier. Si le même service est utilisé pour admin et user,
    // une vérification de rôle (req.user.role) serait nécessaire ici avant de permettre la mise à jour du rôle.
    // Pour l'instant, supposons que c'est une route admin ou que le rôle ne peut pas être modifié par l'utilisateur.
    if (updateData.role) {
        // Logic to prevent non-admin users from changing their role
        // For admin usage, you might want to allow this.
        // For now, let's just ensure it's a valid role if provided
        const validRoles = ['customer', 'seller', 'delivery', 'admin']; // Add 'admin' if admin can set admin role
        if (!validRoles.includes(updateData.role)) {
            throw new ApiError('Rôle utilisateur invalide.', 400);
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true, // Retourne le document modifié
        runValidators: true // Exécute les validateurs du schéma Mongoose lors de la mise à jour
    }).select('-password -__v'); // Exclure les champs sensibles

    if (!updatedUser) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    return updatedUser;
};

/**
 * @desc Supprime un utilisateur (pour usage admin).
 * @param {string} userId - L'ID de l'utilisateur à supprimer.
 * @throws {ApiError} Si l'ID est invalide ou si l'utilisateur n'est pas trouvé.
 */
exports.deleteUser = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw new ApiError('Format d\'ID utilisateur invalide.', 400);
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError('Utilisateur non trouvé.', 404);
    }
    // IMPORTANT : Idéalement, ici, vous devriez également gérer la suppression ou l'anonymisation
    // des données associées à cet utilisateur dans d'autres collections (produits si c'est un vendeur,
    // commandes, avis, adresses, etc.) pour maintenir l'intégrité de la base de données et
    // respecter les réglementations sur la protection des données (ex: RGPD).
    // Cela pourrait être fait par des hooks Mongoose (pre/post 'remove' middleware) sur le modèle User,
    // ou par des appels explicites à d'autres services ici.
};

/**
 * @desc Récupère les utilisateurs par rôle (pour usage admin).
 * @param {string} role - Le rôle des utilisateurs à filtrer.
 * @param {object} query - Paramètres de requête pour le filtrage, la pagination et le tri.
 * @returns {Promise<{users: User[], pagination: object}>} Une liste d'utilisateurs avec le rôle spécifié et les infos de pagination.
 */
exports.getUsersByRole = async (role, query) => {
    // Valider le rôle si nécessaire, ex: ['customer', 'seller', 'delivery', 'admin']
    const validRoles = ['customer', 'seller', 'delivery', 'admin'];
    if (!validRoles.includes(role)) {
        throw new ApiError('Rôle spécifié invalide.', 400);
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role }; // Filtrer par rôle
    if (query.email) {
        filter.email = { $regex: query.email, $options: 'i' };
    }
    if (query.search) {
        filter.$or = [
            { firstName: { $regex: query.search, $options: 'i' } },
            { lastName: { $regex: query.search, $options: 'i' } }
        ];
    }

    const sort = {};
    if (query.sortBy) {
        const [field, order] = query.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1;
    }

    const users = await User.find(filter)
        .select('-password -__v')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return {
        users,
        pagination: {
            total: totalUsers,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};