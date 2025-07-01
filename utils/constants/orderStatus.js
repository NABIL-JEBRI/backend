// backend/src/utils/constants/orderStatus.js

/**
 * @desc Enum-like object for standard order statuses.
 * These statuses represent the lifecycle of a customer order.
 */
const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',           // Initial state: Order placed, awaiting processing/payment confirmation
    PROCESSING: 'processing',     // Order is being prepared/packed
    SHIPPED: 'shipped',           // Order has left the warehouse/seller
    DELIVERED: 'delivered',       // Order has been successfully delivered to the customer
    CANCELLED: 'cancelled',       // Order was cancelled by customer or admin before delivery
    REFUNDED: 'refunded',         // Order was delivered but then fully refunded
    PARTIALLY_REFUNDED: 'partially_refunded', // Part of the order was refunded
    RETURN_REQUESTED: 'return_requested', // Customer initiated a return
    RETURNED: 'returned',         // Item(s) successfully returned
    FAILED: 'failed',             // Payment failed, delivery failed, etc.
    COMPLETED: 'completed'        // Final state: Order fulfilled and closed (can be delivered, refunded etc.)
});

module.exports = ORDER_STATUS;