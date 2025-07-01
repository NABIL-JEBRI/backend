// backend/src/utils/helpers/distanceHelper.js

/**
 * @desc Calculates the distance between two geographical points using the Haversine formula.
 * @param {object} point1 - Object with latitude and longitude (e.g., { lat: 36.8065, lon: 10.1815 }).
 * @param {object} point2 - Object with latitude and longitude.
 * @returns {number} Distance in kilometers.
 */
exports.getDistanceBetweenPoints = (point1, point2) => {
    const R = 6371; // Radius of Earth in kilometers

    if (!point1 || !point2 || typeof point1.lat !== 'number' || typeof point1.lon !== 'number' ||
        typeof point2.lat !== 'number' || typeof point2.lon !== 'number') {
        throw new Error('Both points must have valid latitude and longitude numbers.');
    }

    const lat1Rad = toRadians(point1.lat);
    const lon1Rad = toRadians(point1.lon);
    const lat2Rad = toRadians(point2.lat);
    const lon2Rad = toRadians(point2.lon);

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return parseFloat(distance.toFixed(2));
};

/**
 * @desc Converts degrees to radians.
 * @param {number} deg - Angle in degrees.
 * @returns {number} Angle in radians.
 */
const toRadians = (deg) => {
    return deg * (Math.PI / 180);
};

/**
 * @desc Estimates travel time based on distance and average speed.
 * This is a very rough estimate and does not account for traffic, terrain, etc.
 * @param {number} distanceKm - Distance in kilometers.
 * @param {number} averageSpeedKmPerHour - Average travel speed in km/h.
 * @returns {number} Estimated travel time in hours.
 */
exports.estimateTravelTime = (distanceKm, averageSpeedKmPerHour) => {
    if (typeof distanceKm !== 'number' || distanceKm < 0 || typeof averageSpeedKmPerHour !== 'number' || averageSpeedKmPerHour <= 0) {
        throw new Error('Distance must be non-negative and average speed must be positive.');
    }
    return parseFloat((distanceKm / averageSpeedKmPerHour).toFixed(2));
};

// You might consider integrating with external mapping APIs (Google Maps API, OpenStreetMap API)
// for more accurate distance and travel time calculations in a production environment.