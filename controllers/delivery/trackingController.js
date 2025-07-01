// backend/src/controllers/delivery/trackingController.js
const trackingService = require('../../services/trackingService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get public tracking status for a delivery by tracking number
 * This route is intended for customers to track their orders without logging in.
 * It provides a simplified view of the tracking history.
 * @route   GET /api/v1/tracking/:trackingNumber
 * @access  Public
 */
exports.getTrackingStatus = catchAsync(async (req, res, next) => {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
        return next(new ApiError('Tracking number is required.', 400));
    }

    // Call the service to get the tracking details
    const trackingDetails = await trackingService.getTrackingStatus(trackingNumber);

    if (!trackingDetails) {
        return next(new ApiError('Tracking information not found for this number.', 404));
    }

    // Filter the details returned for public consumption to hide sensitive or internal data.
    // Ensure that 'trackingHistory' is an array of events, each with a status, location, and timestamp.
    const publicTrackingHistory = trackingDetails.trackingHistory.map(history => ({
        status: history.status,
        location: history.location,
        timestamp: history.timestamp,
        // Add other non-sensitive fields from history if applicable (e.g., brief notes)
        notes: history.notes ? history.notes.substring(0, 50) + '...' : undefined, // Truncate or hide sensitive notes
    }));

    res.status(200).json({
        success: true,
        data: {
            trackingNumber: trackingDetails.trackingNumber,
            status: trackingDetails.status,
            currentLocation: trackingDetails.currentLocation,
            estimatedDeliveryDate: trackingDetails.estimatedDeliveryDate,
            lastUpdate: trackingDetails.updatedAt,
            trackingHistory: publicTrackingHistory,
            // Exclude internal notes, delivery person IDs, sensitive addresses etc.
        },
    });
});

/**
 * @desc    Add a new tracking event/update to a delivery.
 * This route is used by authorized personnel (delivery person, admin) to update delivery progress.
 * @route   POST /api/v1/deliveries/:id/track
 * @access  Private (Delivery Person, Admin)
 */
exports.addTrackingEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params; // The ID of the Delivery document
    const { status, location, notes } = req.body;
    const updatedBy = req.user.id; // User making the update (from auth middleware)

    if (!status || !location) {
        return next(new ApiError('Status and location are required for a tracking event.', 400));
    }

    // Authorization check: only authorized users can add tracking events
    // This could also be handled by an authorization middleware on the route itself.
    if (req.user.role !== 'admin' && req.user.role !== 'delivery') {
        return next(new ApiError('Not authorized to add tracking events.', 403));
    }

    // Call the service to add the tracking event
    const updatedDelivery = await trackingService.addTrackingEvent(id, {
        status,
        location,
        notes,
        updatedBy,
    });

    // Return the latest tracking event or the full updated delivery object
    res.status(200).json({
        success: true,
        message: 'Tracking event added successfully.',
        data: updatedDelivery.trackingHistory[updatedDelivery.trackingHistory.length - 1], // Return the newly added event
    });
});

/**
 * @desc    Get detailed tracking history for an authenticated, authorized user.
 * This might be used by the customer viewing their own order details, or by an admin/seller.
 * @route   GET /api/v1/deliveries/:id/detailed-tracking
 * @access  Private (Customer for their own order, Admin, Seller, Delivery Person)
 */
exports.getDetailedTrackingHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Delivery ID
    const userId = req.user.id; // Authenticated user ID

    const trackingDetails = await trackingService.getDetailedTrackingHistory(id);

    if (!trackingDetails) {
        return next(new ApiError('Detailed tracking information not found.', 404));
    }

    // Authorization check: Ensure user is allowed to see detailed info
    // (e.g., it's their delivery, they are admin, or the assigned delivery person)
    const isAuthorized = trackingDetails.user.toString() === userId.toString() ||
                         req.user.role === 'admin' ||
                         (req.user.role === 'seller' && trackingDetails.seller.toString() === userId.toString()) ||
                         (req.user.role === 'delivery' && trackingDetails.assignedTo && trackingDetails.assignedTo.toString() === userId.toString());

    if (!isAuthorized) {
        return next(new ApiError('Not authorized to view detailed tracking for this delivery.', 403));
    }

    res.status(200).json({
        success: true,
        data: trackingDetails, // Return the full tracking details object
    });
});