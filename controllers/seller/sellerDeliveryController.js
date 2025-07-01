// backend/src/controllers/seller/sellerDeliveryController.js
const deliveryService = require('../../services/deliveryService');
const trackingService = require('../../services/trackingService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all deliveries related to the authenticated seller's orders
 * @route   GET /api/v1/seller/deliveries
 * @access  Private (Seller only)
 */
exports.getSellerDeliveries = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const queryParams = { ...req.query, seller: sellerId }; // Filter by seller ID

    const { deliveries, pagination } = await deliveryService.getDeliveries(queryParams);

    res.status(200).json({
        success: true,
        count: deliveries.length,
        pagination,
        data: deliveries,
    });
});

/**
 * @desc    Get detailed tracking information for a specific delivery related to the seller
 * @route   GET /api/v1/seller/deliveries/:deliveryId/tracking
 * @access  Private (Seller only)
 */
exports.getSellerDeliveryTracking = catchAsync(async (req, res, next) => {
    const { deliveryId } = req.params;
    const sellerId = req.user.id;

    const trackingDetails = await trackingService.getDetailedTrackingHistory(deliveryId);

    if (!trackingDetails) {
        return next(new ApiError('Delivery tracking not found.', 404));
    }

    // Ensure the delivery is related to the current seller
    if (trackingDetails.seller.toString() !== sellerId.toString()) {
        return next(new ApiError('Not authorized to view tracking for this delivery.', 403));
    }

    res.status(200).json({
        success: true,
        data: trackingDetails,
    });
});

/**
 * @desc    (Optional) Request a delivery pickup for an order item
 * If sellers are responsible for initiating pickups.
 * @route   POST /api/v1/seller/deliveries/:orderId/request-pickup
 * @access  Private (Seller only)
 */
exports.requestDeliveryPickup = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { pickupDate, pickupTimeSlot } = req.body;
    const sellerId = req.user.id;

    if (!pickupDate || !pickupTimeSlot) {
        return next(new ApiError('Pickup date and time slot are required.', 400));
    }

    // The delivery service would handle creating a pickup request for the seller's order
    const pickupRequest = await deliveryService.createPickupRequest(
        orderId,
        sellerId,
        pickupDate,
        pickupTimeSlot
    );

    res.status(202).json({
        success: true,
        message: 'Delivery pickup request submitted successfully.',
        data: pickupRequest,
    });
});