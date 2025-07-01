// backend/src/utils/security/tokenGenerator.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Pour générer des tokens de réinitialisation sécurisés

/**
 * @desc Generates a JSON Web Token (JWT) for authentication.
 * @param {string} userId - The user ID to include in the token payload.
 * @returns {string} The signed JWT.
 */
exports.generateAuthToken = (userId) => {
    // Le secret JWT doit être une chaîne longue et complexe, stockée dans les variables d'environnement.
    // process.env.JWT_SECRET
    // La date d'expiration doit également être configurée (ex: 1h, 1d, 30m)
    // process.env.JWT_EXPIRES_IN
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        console.error('JWT_SECRET or JWT_EXPIRES_IN not configured in environment variables.');
        throw new Error('Server configuration error: JWT secret or expiry not set.');
    }

    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

/**
 * @desc Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object | null} The decoded payload if valid, null otherwise.
 */
exports.verifyAuthToken = (token) => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured for token verification.');
        return null;
    }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error verifying auth token:', error.message);
        return null; // Token invalid or expired
    }
};

/**
 * @desc Generates a cryptographically secure random token for password reset.
 * This token is sent to the user via email. It is then hashed and stored in the database.
 * @param {boolean} [hashForStorage=false] - If true, returns the SHA256 hashed version suitable for DB storage.
 * @returns {string} The raw token (for email) or the hashed token (for DB).
 */
exports.generatePasswordResetToken = (hashForStorage = false) => {
    // Generate a random 32-byte token
    const resetToken = crypto.randomBytes(32).toString('hex');

    if (hashForStorage) {
        // Hash the token before storing it in the database for security
        // Use 'sha256' for hashing
        return crypto.createHash('sha256').update(resetToken).digest('hex');
    }

    // Return the plain token to be sent to the user's email
    return resetToken;
};

// Note: The actual storage of `passwordResetToken` (hashed) and `passwordResetExpires`
// fields should be handled within your User model, with a method like:
// userSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
//   return resetToken; // Return the unhashed token to the user
// };