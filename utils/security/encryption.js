// backend/src/utils/security/encryption.js
const bcrypt = require('bcryptjs');

// Nombre de "rounds" pour le salage bcrypt.
// Plus le nombre est élevé, plus le hachage est sécurisé, mais plus il est lent.
// 10 est une bonne valeur par défaut.
const SALT_ROUNDS = 10; 

/**
 * @desc Hashes a plain text password.
 * @param {string} plainPassword - The password in plain text.
 * @returns {Promise<string>} The hashed password.
 * @throws {Error} If hashing fails.
 */
exports.hashPassword = async (plainPassword) => {
    if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
        throw new Error('Password must be a non-empty string to hash.');
    }
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password.');
    }
};

/**
 * @desc Compares a plain text password with a hashed password.
 * @param {string} plainPassword - The password in plain text.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 * @throws {Error} If comparison fails.
 */
exports.comparePassword = async (plainPassword, hashedPassword) => {
    if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
        throw new Error('Both passwords must be strings for comparison.');
    }
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Failed to compare password.');
    }
};