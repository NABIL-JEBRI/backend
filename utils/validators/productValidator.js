// backend/src/utils/validators/productValidator.js
const Joi = require('joi');
const { isValidObjectId } = require('./commonValidator'); // Pour valider les IDs MongoDB

// Schéma pour la création d'un nouveau produit
const createProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255).required().messages({
        'string.min': 'Product name must be at least {#limit} characters long.',
        'string.max': 'Product name cannot exceed {#limit} characters.',
        'any.required': 'Product name is required.'
    }),
    description: Joi.string().trim().min(10).max(2000).required().messages({
        'string.min': 'Product description must be at least {#limit} characters long.',
        'string.max': 'Product description cannot exceed {#limit} characters.',
        'any.required': 'Product description is required.'
    }),
    price: Joi.number().positive().precision(2).required().messages({
        'number.base': 'Price must be a number.',
        'number.positive': 'Price must be a positive number.',
        'number.precision': 'Price can have at most {#limit} decimal places.',
        'any.required': 'Price is required.'
    }),
    discountPrice: Joi.number().min(0).precision(2).less(Joi.ref('price')).optional().messages({
        'number.base': 'Discount price must be a number.',
        'number.min': 'Discount price cannot be negative.',
        'number.less': 'Discount price must be less than the regular price.'
    }),
    category: Joi.string().custom((value, helpers) => { // Custom validation for ObjectId
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid category ID format.' });
        }
        return value;
    }).required().messages({
        'any.required': 'Category is required.',
        'any.invalid': 'Invalid category ID.'
    }),
    brand: Joi.string().trim().allow('').optional(), // Optional brand name or ID
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Stock must be a number.',
        'number.integer': 'Stock must be an integer.',
        'number.min': 'Stock cannot be negative.',
        'any.required': 'Stock is required.'
    }),
    images: Joi.array().items(Joi.string().uri().messages({
        'string.uri': 'Each image must be a valid URL.'
    })).min(1).required().messages({
        'array.min': 'At least one image URL is required.',
        'any.required': 'Images are required.'
    }),
    // Les champs 'seller' et 'isApproved' seront définis par le backend (via l'utilisateur auth ou l'admin)
    seller: Joi.string().custom((value, helpers) => { // Validated but typically set by the server
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid seller ID format.' });
        }
        return value;
    }).optional(),
    isApproved: Joi.boolean().optional(),
    specifications: Joi.object().pattern(Joi.string(), Joi.string().allow('')).optional(), // Flexible key-value for specs
    tags: Joi.array().items(Joi.string().trim().min(1)).optional()
});

// Schéma pour la mise à jour d'un produit (partial update)
const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(255),
    description: Joi.string().trim().min(10).max(2000),
    price: Joi.number().positive().precision(2),
    discountPrice: Joi.number().min(0).precision(2).when('price', { // Discount must be less than price if price is also updated
        is: Joi.exist(),
        then: Joi.number().less(Joi.ref('price'))
    }),
    category: Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', { message: 'Invalid category ID format.' });
        }
        return value;
    }),
    brand: Joi.string().trim().allow(''),
    stock: Joi.number().integer().min(0),
    images: Joi.array().items(Joi.string().uri().messages({
        'string.uri': 'Each image must be a valid URL.'
    })).min(1),
    isApproved: Joi.boolean(), // Admin can change this
    specifications: Joi.object().pattern(Joi.string(), Joi.string().allow('')).optional(),
    tags: Joi.array().items(Joi.string().trim().min(1)).optional()
}).min(1).messages({ // Requires at least one field to be present for update
    'object.min': 'At least one field to update is required.'
});

module.exports = {
    createProductSchema,
    updateProductSchema
};