// backend/src/utils/security/sanitization.js
const xss = require('xss'); // Pour la prévention XSS
const validator = require('validator'); // Pour des fonctions de désinfection plus spécifiques

/**
 * @desc Sanitizes a string to prevent XSS attacks.
 * Uses the 'xss' library to strip potentially malicious HTML.
 * @param {string} input - The string to sanitize.
 * @returns {string} The sanitized string.
 */
exports.sanitizeHtml = (input) => {
    if (typeof input !== 'string') {
        return input; // Return as is if not a string
    }
    return xss(input);
};

/**
 * @desc Trims whitespace from a string.
 * @param {string} input - The string to trim.
 * @returns {string} The trimmed string.
 */
exports.trimString = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    return input.trim();
};

/**
 * @desc Escapes HTML entities in a string.
 * Useful when displaying user-generated content that might contain HTML.
 * @param {string} input - The string to escape.
 * @returns {string} The escaped string.
 */
exports.escapeHtml = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    return validator.escape(input);
};

/**
 * @desc Sanitizes an email address.
 * Removes dots from the local part (for Gmail), and converts to lowercase.
 * @param {string} email - The email address to sanitize.
 * @returns {string} The sanitized email.
 */
exports.sanitizeEmail = (email) => {
    if (typeof email !== 'string') {
        return email;
    }
    // Normalize email: remove dots from gmail addresses, convert to lowercase
    return validator.normalizeEmail(email, {
        gmail_remove_dots: false // Keep dots for exact email matching, or true to normalize
    });
};

/**
 * @desc Strips all non-alphanumeric characters from a string.
 * @param {string} input - The string to sanitize.
 * @returns {string} The alphanumeric string.
 */
exports.stripNonAlphanumeric = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    return input.replace(/[^a-zA-Z0-9]/g, '');
};

// You might add more specific sanitization functions as needed,
// e.g., for phone numbers, currency values, specific IDs, etc.