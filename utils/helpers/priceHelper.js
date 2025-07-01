// backend/src/utils/helpers/priceHelper.js

/**
 * @desc Calculates the final price of an item after applying a discount.
 * @param {number} originalPrice - The original price of the item.
 * @param {number} [discountPercentage=0] - The discount percentage (e.g., 10 for 10%).
 * @returns {number} The final price, rounded to 2 decimal places.
 */
exports.calculateDiscountedPrice = (originalPrice, discountPercentage = 0) => {
    if (typeof originalPrice !== 'number' || originalPrice < 0) {
        throw new Error('Original price must be a non-negative number.');
    }
    if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('Discount percentage must be between 0 and 100.');
    }

    const discountAmount = originalPrice * (discountPercentage / 100);
    const finalPrice = originalPrice - discountAmount;
    return parseFloat(finalPrice.toFixed(2));
};

/**
 * @desc Calculates the price after adding tax.
 * @param {number} basePrice - The base price of the item.
 * @param {number} [taxRate=0] - The tax rate (e.g., 20 for 20% VAT).
 * @returns {number} The price including tax, rounded to 2 decimal places.
 */
exports.calculatePriceWithTax = (basePrice, taxRate = 0) => {
    if (typeof basePrice !== 'number' || basePrice < 0) {
        throw new Error('Base price must be a non-negative number.');
    }
    if (typeof taxRate !== 'number' || taxRate < 0) {
        throw new Error('Tax rate must be a non-negative number.');
    }

    const taxAmount = basePrice * (taxRate / 100);
    const priceWithTax = basePrice + taxAmount;
    return parseFloat(priceWithTax.toFixed(2));
};

/**
 * @desc Calculates the total amount for an order from a list of items.
 * Each item is expected to have 'price' and 'quantity'.
 * @param {Array<object>} items - An array of item objects, each with 'price' and 'quantity'.
 * @returns {number} The total amount, rounded to 2 decimal places.
 */
exports.calculateOrderTotal = (items) => {
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array.');
    }

    let total = 0;
    for (const item of items) {
        if (typeof item.price !== 'number' || item.price < 0 || typeof item.quantity !== 'number' || item.quantity < 1) {
            console.warn('Invalid item found in order calculation:', item);
            continue; // Skip invalid items or throw an error based on strictness
        }
        total += item.price * item.quantity;
    }
    return parseFloat(total.toFixed(2));
};

/**
 * @desc Applies a coupon discount to a total amount.
 * @param {number} totalAmount - The total amount before coupon.
 * @param {object} coupon - The coupon object { type: 'percentage' | 'fixed', value: number }.
 * @returns {number} The amount after coupon discount, rounded to 2 decimal places.
 */
exports.applyCoupon = (totalAmount, coupon) => {
    if (typeof totalAmount !== 'number' || totalAmount < 0) {
        throw new Error('Total amount must be a non-negative number.');
    }
    if (!coupon || typeof coupon.type !== 'string' || typeof coupon.value !== 'number' || coupon.value < 0) {
        return parseFloat(totalAmount.toFixed(2)); // No valid coupon, return original total
    }

    let discountedAmount = totalAmount;

    switch (coupon.type) {
        case 'percentage':
            if (coupon.value > 100) coupon.value = 100; // Cap percentage at 100%
            discountedAmount = totalAmount - (totalAmount * (coupon.value / 100));
            break;
        case 'fixed':
            discountedAmount = totalAmount - coupon.value;
            break;
        default:
            console.warn('Unknown coupon type:', coupon.type);
            break;
    }

    // Ensure discounted amount doesn't go below zero
    return parseFloat(Math.max(0, discountedAmount).toFixed(2));
};