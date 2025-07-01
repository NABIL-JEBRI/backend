// backend/src/utils/constants/deliveryStatus.js

/**
 * @desc Enum-like object for standard delivery statuses.
 * These statuses represent the lifecycle of a delivery process.
 */
const DELIVERY_STATUS = Object.freeze({
    PENDING_PICKUP: 'pending_pickup', // Item is ready to be picked up by delivery person
    OUT_FOR_DELIVERY: 'out_for_delivery', // Delivery person is en route with the item
    DELIVERED: 'delivered',           // Item has been successfully delivered
    FAILED_ATTEMPT: 'failed_attempt', // Delivery attempt failed (e.g., recipient not available)
    CANCELLED: 'cancelled',           // Delivery was cancelled
    SCHEDULED: 'scheduled',           // Delivery is scheduled for a specific time/date
    AT_PICKUP_POINT: 'at_pickup_point', // Item has arrived at a pickup point
    READY_FOR_COLLECTION: 'ready_for_collection', // Item is ready for customer collection at pickup point
    COLLECTED: 'collected',           // Item has been collected by the customer
    RETURNING: 'returning',           // Item is being returned to sender (after failed attempts or customer request)
    RETURNED_TO_SENDER: 'returned_to_sender' // Item has been returned to the original sender
});

module.exports = DELIVERY_STATUS;