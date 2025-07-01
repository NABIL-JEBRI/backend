// backend/src/utils/helpers/deliveryHelper.js
const { getDistanceBetweenPoints } = require('./distanceHelper'); // Assurez-vous d'avoir distanceHelper

/**
 * @desc Determines the estimated delivery date based on delivery method and current time.
 * @param {string} deliveryMethod - e.g., 'standard', 'express', 'pickup_point'.
 * @param {Date} [orderDate=new Date()] - The date the order was placed.
 * @returns {Date} The estimated delivery date.
 */
exports.getEstimatedDeliveryDate = (deliveryMethod, orderDate = new Date()) => {
    let daysToAdd = 0;

    switch (deliveryMethod.toLowerCase()) {
        case 'express':
            daysToAdd = 1; // Next day delivery
            break;
        case 'standard':
            daysToAdd = 3; // 3-5 business days, let's say 3
            break;
        case 'pickup_point':
            daysToAdd = 2; // Ready for pickup in 2 days
            break;
        case 'door_to_door':
            daysToAdd = 2; // Typically 2-3 days
            break;
        default:
            daysToAdd = 5; // Default to a longer estimate
            break;
    }

    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + daysToAdd);
    // You might want to add logic to skip weekends/holidays here
    return estimatedDate;
};

/**
 * @desc Calculates shipping cost based on delivery method, distance, and weight.
 * This is a simplified example; real-world scenarios are much more complex.
 * @param {string} deliveryMethod - e.g., 'standard', 'express'.
 * @param {number} distanceKm - Distance in kilometers.
 * @param {number} totalWeightKg - Total weight of the package in kilograms.
 * @returns {number} The calculated shipping cost.
 */
exports.calculateShippingCost = (deliveryMethod, distanceKm, totalWeightKg) => {
    let baseCost = 0;
    let distanceRate = 0;
    let weightRate = 0;

    switch (deliveryMethod.toLowerCase()) {
        case 'express':
            baseCost = 10.00;
            distanceRate = 0.50; // per km
            weightRate = 1.00; // per kg
            break;
        case 'standard':
            baseCost = 5.00;
            distanceRate = 0.20; // per km
            weightRate = 0.50; // per kg
            break;
        case 'pickup_point':
            baseCost = 2.00; // Fixed low cost for pickup points
            distanceRate = 0;
            weightRate = 0;
            break;
        case 'door_to_door':
            baseCost = 7.00;
            distanceRate = 0.30;
            weightRate = 0.70;
            break;
        default:
            baseCost = 8.00; // Fallback cost
            break;
    }

    const cost = baseCost + (distanceKm * distanceRate) + (totalWeightKg * weightRate);
    return parseFloat(cost.toFixed(2));
};

/**
 * @desc Checks if a delivery address is within a serviceable area.
 * This is a placeholder and would typically involve geocoding and zone checks.
 * @param {object} address - The address object { street, city, postalCode, country }.
 * @returns {boolean} True if serviceable, false otherwise.
 */
exports.isServiceableArea = (address) => {
    // Example: Simple check for specific postal codes or cities
    const serviceablePostalCodes = ['1000', '2000', '3000', '4000', '5000', '8000']; // Example Tunisian postal codes
    const serviceableCities = ['Tunis', 'Sousse', 'Sfax', 'Monastir']; // Example cities in Tunisia

    const isPostalCodeServiceable = address.postalCode && serviceablePostalCodes.includes(address.postalCode.substring(0, 4));
    const isCityServiceable = address.city && serviceableCities.includes(address.city);

    return isPostalCodeServiceable || isCityServiceable;
};


/**
 * @desc Finds the closest available delivery slot for a given area and delivery method.
 * @param {Array<object>} availableSlots - Array of delivery slot objects.
 * @param {string} areaCode - The area code (e.g., postal code).
 * @param {string} deliveryMethod - The preferred delivery method.
 * @returns {object | null} The closest available slot, or null if none found.
 */
exports.findClosestDeliverySlot = (availableSlots, areaCode, deliveryMethod) => {
    const now = new Date();
    // Filter slots for the area, method, and future dates/times
    const relevantSlots = availableSlots.filter(slot => {
        const slotDate = new Date(slot.date);
        const [slotHours, slotMinutes] = slot.startTime.split(':').map(Number);
        slotDate.setHours(slotHours, slotMinutes, 0, 0);

        return slot.areaCode === areaCode &&
               slot.deliveryMethod === deliveryMethod &&
               slot.capacity > 0 && // Ensure there's capacity
               slotDate > now; // Only future slots
    });

    if (relevantSlots.length === 0) {
        return null;
    }

    // Sort by date and then by start time to find the closest
    relevantSlots.sort((a, b) => {
        const dateA = new Date(a.date);
        const [hA, mA] = a.startTime.split(':').map(Number);
        dateA.setHours(hA, mA, 0, 0);

        const dateB = new Date(b.date);
        const [hB, mB] = b.startTime.split(':').map(Number);
        dateB.setHours(hB, mB, 0, 0);

        return dateA.getTime() - dateB.getTime();
    });

    return relevantSlots[0];
};

/**
 * @desc Calculates the total weight of items in a cart/order.
 * @param {Array<object>} items - Array of item objects, each with 'weight' and 'quantity'.
 * @returns {number} The total weight in kilograms.
 */
exports.calculateTotalOrderWeight = (items) => {
    let totalWeight = 0;
    for (const item of items) {
        if (typeof item.weight === 'number' && item.weight > 0 && typeof item.quantity === 'number' && item.quantity > 0) {
            totalWeight += item.weight * item.quantity;
        } else {
            console.warn('Invalid item weight or quantity encountered:', item);
        }
    }
    return parseFloat(totalWeight.toFixed(2));
};