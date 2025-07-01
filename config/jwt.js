// backend/src/config/jwt.js

/**
 * @desc JWT configuration settings.
 * Retrieves JWT secret and expiration from environment variables.
 */
const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour if not specified
    cookieName: 'jwt' // Name for the JWT cookie
};

// Validate that JWT_SECRET is set
if (!jwtConfig.secret) {
    console.warn('WARNING: JWT_SECRET is not defined in environment variables. JWT authentication may not work correctly.');
    // In a production environment, you might want to throw an error and exit the process.
    // process.exit(1);
}

module.exports = jwtConfig;