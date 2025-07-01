// backend/src/utils/validators/deliveryValidator.js
const Joi = require('joi');
const { isValidObjectId } = require('./commonValidator'); // Pour valider les IDs MongoDB

// Schéma pour la mise à jour du statut d'une livraison
const updateDeliveryStatusSchema = Joi.object({
    newStatus: Joi.string().valid('pending_pickup', 'out_for_delivery', 'delivered', 'failed_attempt', 'cancelled').required().messages({
        'any.only': 'Invalid delivery status provided.',
        'any.required': 'New status is required.'
    }),
    currentLocation: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
    }).optional().messages({
        'object.base': 'Current location must be an object with latitude and longitude.'
    }),
    deliveredBy: Joi.string().trim().max(100).optional().messages({ // Name of the person who delivered
        'string.max': 'Delivered by name cannot exceed {#limit} characters.'
    }),
    deliverySignature: Joi.string().uri().optional().messages({ // URL to signature image
        'string.uri': 'Delivery signature must be a valid URL.'
    }),
    notes: Joi.string().trim().max(500).optional().allow('')
});

// Schéma pour l'affectation d'une livraison à un livreur
const assignDeliverySchema = Joi.object({
    deliveryPersonId: Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid delivery person ID format.' });
        }
        return value;
    }).required().messages({
        'any.required': 'Delivery person ID is required.'
    })
});

// Schéma pour la création d'un créneau de livraison (par l'admin)
const createDeliverySlotSchema = Joi.object({
    date: Joi.date().iso().required().messages({ // ISO 8601 date string
        'date.base': 'Date must be a valid date.',
        'date.format': 'Date must be in ISO 8601 format (YYYY-MM-DD).',
        'any.required': 'Date is required.'
    }),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({ // HH:MM format
        'string.pattern.base': 'Start time must be in HH:MM format.',
        'any.required': 'Start time is required.'
    }),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({ // HH:MM format
        'string.pattern.base': 'End time must be in HH:MM format.',
        'any.required': 'End time is required.'
    }),
    capacity: Joi.number().integer().min(1).required().messages({
        'number.integer': 'Capacity must be an integer.',
        'number.min': 'Capacity must be at least {#limit}.',
        'any.required': 'Capacity is required.'
    }),
    areaCode: Joi.string().trim().required().messages({ // e.g., postal code, city name
        'any.required': 'Area code is required.'
    }),
    deliveryMethod: Joi.string().valid('standard', 'express', 'pickup_point', 'door_to_door').required().messages({
        'any.only': 'Invalid delivery method.',
        'any.required': 'Delivery method is required.'
    }),
    isActive: Joi.boolean().default(true).optional()
});

// Schéma pour la mise à jour d'un créneau de livraison
const updateDeliverySlotSchema = Joi.object({
    date: Joi.date().iso(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    capacity: Joi.number().integer().min(0),
    areaCode: Joi.string().trim(),
    deliveryMethod: Joi.string().valid('standard', 'express', 'pickup_point', 'door_to_door'),
    isActive: Joi.boolean()
}).min(1).messages({
    'object.min': 'At least one field to update is required.'
});

module.exports = {
    updateDeliveryStatusSchema,
    assignDeliverySchema,
    createDeliverySlotSchema,
    updateDeliverySlotSchema
};