// backend/src/utils/validators/userValidator.js
const Joi = require('joi');

// Schéma pour l'inscription d'un nouvel utilisateur
const registerUserSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'First name must be a string.',
        'string.empty': 'First name cannot be empty.',
        'string.min': 'First name should have a minimum length of {#limit}.',
        'string.max': 'First name should have a maximum length of {#limit}.',
        'any.required': 'First name is required.'
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'Last name must be a string.',
        'string.empty': 'Last name cannot be empty.',
        'string.min': 'Last name should have a minimum length of {#limit}.',
        'string.max': 'Last name should have a maximum length of {#limit}.',
        'any.required': 'Last name is required.'
    }),
    email: Joi.string().trim().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
        .required()
        .messages({
            'string.base': 'Password must be a string.',
            'string.empty': 'Password cannot be empty.',
            'string.min': 'Password should be at least {#limit} characters long.',
            'string.max': 'Password should not exceed {#limit} characters.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'any.required': 'Password is required.'
        }),
    // Le rôle peut être 'customer' par défaut, ou soumis pour approbation admin si 'seller'
    role: Joi.string().valid('customer', 'seller', 'delivery').default('customer').messages({
        'any.only': 'Invalid user role.'
    })
});

// Schéma pour la connexion d'un utilisateur
const loginUserSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().required().messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password cannot be empty.',
        'any.required': 'Password is required.'
    })
});

// Schéma pour la mise à jour du profil utilisateur (partial update)
const updateUserProfileSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50),
    lastName: Joi.string().trim().min(2).max(50),
    phoneNumber: Joi.string().trim().pattern(/^\+?\d{8,15}$/).messages({ // Example: +21612345678
        'string.pattern.base': 'Phone number must be a valid international phone number.'
    }),
    profilePicture: Joi.string().uri().messages({ // Expecting a URL to the image
        'string.uri': 'Profile picture must be a valid URL.'
    }),
    // D'autres champs non sensibles peuvent être ajoutés ici
    bio: Joi.string().trim().max(500),
    // Pour les vendeurs, des champs spécifiques peuvent être validés ici ou dans un sellerValidator dédié
    storeName: Joi.string().trim().min(3).max(100),
    businessDescription: Joi.string().trim().max(1000),
    bankAccountDetails: Joi.object({
        bankName: Joi.string().trim(),
        accountNumber: Joi.string().trim(),
        swiftCode: Joi.string().trim(),
        // ... autres détails bancaires
    })
}).min(1).messages({ // Requires at least one field to be present for update
    'object.min': 'At least one field to update is required.'
});

// Schéma pour la modification du mot de passe
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required.'
    }),
    newPassword: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
        .required()
        .messages({
            'string.min': 'New password should be at least {#limit} characters long.',
            'string.max': 'New password should not exceed {#limit} characters.',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'any.required': 'New password is required.'
        }),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Confirm new password must match new password.',
        'any.required': 'Confirm new password is required.'
    })
});

// Schéma pour la demande de réinitialisation de mot de passe (via email)
const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'any.required': 'Email is required.'
    })
});

// Schéma pour la réinitialisation du mot de passe (avec token)
const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Reset token is required.'
    }),
    newPassword: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)
        .required()
        .messages({
            'string.min': 'New password should be at least {#limit} characters long.',
            'string.max': 'New password should not exceed {#limit} characters.',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'any.required': 'New password is required.'
        }),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Confirm new password must match new password.',
        'any.required': 'Confirm new password is required.'
    })
});

module.exports = {
    registerUserSchema,
    loginUserSchema,
    updateUserProfileSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};