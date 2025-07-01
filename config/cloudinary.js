// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

/**
 * @desc Configures Cloudinary with API credentials from environment variables.
 * Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.
 */
const configureCloudinary = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.warn('WARNING: Cloudinary credentials are not fully defined in environment variables. Image uploads may fail.');
        // In a production environment, you might consider throwing an error.
        // throw new Error('Cloudinary credentials missing.');
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log('Cloudinary configured.');
};

module.exports = configureCloudinary;