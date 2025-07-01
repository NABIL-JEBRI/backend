// backend/src/utils/helpers/stringHelper.js

/**
 * @desc Generates a URL-friendly slug from a string.
 * @param {string} text - The input string.
 * @returns {string} The generated slug.
 */
exports.generateSlug = (text) => {
    if (typeof text !== 'string') {
        return '';
    }
    return text
        .toString()
        .normalize('NFD') // Normalize diacritics
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase() // Convert to lowercase
        .trim() // Trim whitespace from both ends
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .substring(0, 100); // Truncate to a reasonable length
};

/**
 * @desc Capitalizes the first letter of a string.
 * @param {string} text - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
exports.capitalizeFirstLetter = (text) => {
    if (typeof text !== 'string' || text.length === 0) {
        return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * @desc Truncates a string to a specified length and appends ellipsis if truncated.
 * @param {string} text - The input string.
 * @param {number} maxLength - The maximum length of the string.
 * @returns {string} The truncated string.
 */
exports.truncateString = (text, maxLength) => {
    if (typeof text !== 'string') {
        return '';
    }
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

/**
 * @desc Generates a random alphanumeric string of a specified length.
 * @param {number} length - The desired length of the string.
 * @returns {string} A random alphanumeric string.
 */
exports.generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * @desc Removes HTML tags from a string.
 * @param {string} htmlString - The HTML string.
 * @returns {string} The plain text string.
 */
exports.stripHtmlTags = (htmlString) => {
    if (typeof htmlString !== 'string') {
        return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
};