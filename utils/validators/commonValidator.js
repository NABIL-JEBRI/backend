// backend/src/utils/validators/commonValidator.js
const Joi = require('joi');
const { Types } = require('mongoose'); // Pour vérifier les ObjectId de MongoDB

/**
 * @desc Joi schema for validating MongoDB ObjectId strings.
 * This can be reused across different validators for foreign keys.
 */
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId.'
});

/**
 * @desc Helper function to check if a string is a valid MongoDB ObjectId.
 * Useful for custom Joi validations or direct checks in services.
 * @param {string} id - The string to validate.
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
    return Types.ObjectId.isValid(id) && (new Types.ObjectId(id)).toString() === id;
};

/**
 * @desc Joi schema for common pagination query parameters.
 */
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.integer': 'Page must be an integer.',
        'number.min': 'Page must be at least {#limit}.'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.integer': 'Limit must be an integer.',
        'number.min': 'Limit must be at least {#limit}.',
        'number.max': 'Limit cannot exceed {#limit}.'
    }),
    sortBy: Joi.string().trim().optional(), // e.g., 'createdAt:desc', 'price:asc'
    filter: Joi.object().pattern(Joi.string(), Joi.string().allow('', null)).optional(), // Generic filter object
});

/**
 * @desc Middleware factory for Joi validation.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @param {string} property - The property of req to validate (e.g., 'body', 'query', 'params').
 * @returns {function} - Express middleware function.
 */
const validate = (schema, property) => (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false, allowUnknown: true });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors
        });
    }
    next();
};

module.exports = {
    objectIdSchema,
    isValidObjectId,
    paginationSchema,
    validate
};