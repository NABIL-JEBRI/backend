// backend/src/config/delivery.js

/**
 * @desc Configuration settings for external delivery services.
 * This can include API keys, base URLs, or specific service parameters.
 *
 * Example: Integration with a hypothetical "FastDeliver" API.
 */
const deliveryConfig = {
    // FastDeliver API credentials
    fastDeliver: {
        apiKey: process.env.FASTDELIVER_API_KEY,
        baseUrl: process.env.FASTDELIVER_BASE_URL || 'https://api.fastdeliver.com/v1',
        defaultServiceType: 'standard', // e.g., 'express', 'standard'
        timeout: 5000 // Timeout for API requests in ms
    },
    // Add configurations for other delivery partners if applicable
    localDelivery: {
        isEnabled: process.env.LOCAL_DELIVERY_ENABLED === 'true',
        maxDistanceKm: parseFloat(process.env.LOCAL_DELIVERY_MAX_DISTANCE_KM) || 50,
        costPerKm: parseFloat(process.env.LOCAL_DELIVERY_COST_PER_KM) || 0.5
    },
    // Default delivery method settings
    defaultMethod: process.env.DEFAULT_DELIVERY_METHOD || 'fastDeliver', // 'fastDeliver' or 'localDelivery'
    trackingUrlBase: process.env.DELIVERY_TRACKING_URL_BASE || 'https://track.fastdeliver.com/'
};

// Basic validation for critical delivery service keys
if (deliveryConfig.fastDeliver.enabled && !deliveryConfig.fastDeliver.apiKey) {
    console.warn('WARNING: FASTDELIVER_API_KEY is not defined. FastDeliver integration may not work.');
}

module.exports = deliveryConfig;