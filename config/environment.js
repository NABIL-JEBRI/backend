// backend/src/config/environment.js

/**
 * @desc General environment configuration for the application.
 * Provides easy access to critical environment variables and their defaults.
 */
const environmentConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000, // Parse port as integer
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`, // Base URL for backend itself
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'), // Logging level

    // Add any other general application-wide settings here
    apiVersion: 'v1',
    uploadLimitMb: 5 // Max file upload limit
};

module.exports = environmentConfig;