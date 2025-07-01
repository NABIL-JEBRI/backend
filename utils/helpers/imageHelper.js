// backend/src/utils/helpers/imageHelper.js

/**
 * @desc Generates a unique filename for an uploaded image.
 * Combines timestamp and a random string.
 * @param {string} originalFilename - The original filename with extension.
 * @returns {string} A unique filename (e.g., "1678886400000-randomstring.jpg").
 */
exports.generateUniqueFilename = (originalFilename) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8); // Short random string
    const extension = originalFilename.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
};

/**
 * @desc Checks if a file has a valid image extension.
 * @param {string} filename - The filename to check.
 * @returns {boolean} True if the extension is valid, false otherwise.
 */
exports.isValidImageExtension = (filename) => {
    if (typeof filename !== 'string' || !filename.includes('.')) {
        return false;
    }
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
};

/**
 * @desc Returns the URL for an image stored on a CDN or cloud storage.
 * This is a placeholder; you'd configure your actual CDN base URL.
 * @param {string} imageName - The name of the image file.
 * @returns {string} The full URL to the image.
 */
exports.getImageCdnUrl = (imageName) => {
    // Replace with your actual CDN or storage bucket URL
    const CDN_BASE_URL = process.env.IMAGE_CDN_BASE_URL || 'https://your-cdn.com/images/';
    if (typeof imageName !== 'string' || imageName.length === 0) {
        return '';
    }
    return `${CDN_BASE_URL}${imageName}`;
};

/**
 * @desc Validates the size of an image file.
 * @param {number} fileSizeInBytes - The size of the file in bytes.
 * @param {number} maxSizeBytes - The maximum allowed size in bytes.
 * @returns {boolean} True if the file size is within limits, false otherwise.
 */
exports.isValidImageSize = (fileSizeInBytes, maxSizeBytes) => {
    if (typeof fileSizeInBytes !== 'number' || typeof maxSizeBytes !== 'number' || fileSizeInBytes < 0 || maxSizeBytes < 0) {
        return false;
    }
    return fileSizeInBytes <= maxSizeBytes;
};

// You might consider adding functions for:
// - Image resizing (if done server-side)
// - Image optimization (compression)
// - Deleting images from storage (if your app manages this)