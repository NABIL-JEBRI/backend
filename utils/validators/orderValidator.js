// backend/src/utils/validators/orderValidator.js
const Joi = require('joi');
const { isValidObjectId } = require('./commonValidator'); // Pour valider les IDs MongoDB

// Schéma pour un article individuel dans le panier/commande
const orderItemSchema = Joi.object({
    productId: Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid product ID format.' });
        }
        return value;
    }).required().messages({
        'any.required': 'Product ID is required for each item.'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number.',
        'number.integer': 'Quantity must be an integer.',
        'number.min': 'Quantity must be at least {#limit}.',
        'any.required': 'Quantity is required for each item.'
    }),
    price: Joi.number().positive().precision(2).required().messages({
        'number.base': 'Price must be a number.',
        'number.positive': 'Price must be a positive number.',
        'number.precision': 'Price can have at most {#limit} decimal places.',
        'any.required': 'Price is required for each item.'
    }),
    // Autres champs pertinents pour l'article (nom, image, sellerId, etc.) peuvent être ajoutés
    name: Joi.string().trim().required(),
    image: Joi.string().uri().optional(),
    seller: Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid seller ID format.' });
        }
        return value;
    }).required() // Assuming seller is identified per item
});

// Schéma pour l'adresse de livraison (peut être réutilisé depuis userValidator ou défini ici)
const addressSchema = Joi.object({
    street: Joi.string().trim().min(3).max(255).required().messages({
        'any.required': 'Street is required.'
    }),
    city: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'City is required.'
    }),
    state: Joi.string().trim().min(2).max(100).optional().allow(''),
    postalCode: Joi.string().trim().alphanum().min(3).max(10).required().messages({
        'any.required': 'Postal code is required.'
    }),
    country: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Country is required.'
    }),
    // Optionnel: nom du destinataire, numéro de téléphone, instructions spéciales
    fullName: Joi.string().trim().min(3).max(100).optional(),
    phoneNumber: Joi.string().trim().pattern(/^\+?\d{8,15}$/).optional(),
    instructions: Joi.string().trim().max(500).optional().allow('')
});

// Schéma pour la création d'une nouvelle commande (sans paiement initial)
const createOrderSchema = Joi.object({
    // L'ID utilisateur sera tiré de req.user
    items: Joi.array().items(orderItemSchema).min(1).required().messages({
        'array.min': 'Order must contain at least one item.',
        'any.required': 'Order items are required.'
    }),
    shippingAddress: addressSchema.required().messages({
        'any.required': 'Shipping address is required.'
    }),
    // deliveryMethod: 'standard', 'express', 'pickup_point'
    deliveryMethod: Joi.string().valid('standard', 'express', 'pickup_point', 'door_to_door').required().messages({
        'any.only': 'Invalid delivery method.',
        'any.required': 'Delivery method is required.'
    }),
    // Optionnel si le mode de livraison est 'pickup_point'
    pickupPointId: Joi.string().custom((value, helpers) => {
        if (value && !isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid pickup point ID format.' });
        }
        return value;
    }).when('deliveryMethod', {
        is: 'pickup_point',
        then: Joi.required(),
        otherwise: Joi.forbidden() // Only allowed if deliveryMethod is pickup_point
    }).messages({
        'any.required': 'Pickup point ID is required for pickup point delivery method.'
    }),
    // deliverySlotId est géré par deliveryController lors de la sélection du créneau
    // totalAmount et shippingCost seront calculés côté serveur
    // paymentMethod: 'cash_on_delivery', 'credit_card', 'paypal'
    paymentMethod: Joi.string().valid('cash_on_delivery', 'credit_card', 'paypal', 'bank_transfer').required().messages({
        'any.only': 'Invalid payment method.',
        'any.required': 'Payment method is required.'
    }),
    couponCode: Joi.string().trim().optional().allow('')
});

// Schéma pour la mise à jour du statut d'une commande (par admin ou vendeur autorisé)
const updateOrderStatusSchema = Joi.object({
    newStatus: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned').required().messages({
        'any.only': 'Invalid new status provided.',
        'any.required': 'New status is required.'
    }),
    notes: Joi.string().trim().max(500).optional().allow('')
});

// Schéma pour une demande de retour
const createReturnRequestSchema = Joi.object({
    orderItemId: Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid order item ID format.' });
        }
        return value;
    }).required().messages({
        'any.required': 'Order item ID is required for a return.'
    }),
    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.min': 'Reason must be at least {#limit} characters long.',
        'string.max': 'Reason cannot exceed {#limit} characters.',
        'any.required': 'Reason for return is required.'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.min': 'Quantity to return must be at least {#limit}.',
        'any.required': 'Quantity to return is required.'
    }),
    images: Joi.array().items(Joi.string().uri()).optional() // Images of the return item/issue
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    createReturnRequestSchema,
    addressSchema // Export address schema for reuse
};