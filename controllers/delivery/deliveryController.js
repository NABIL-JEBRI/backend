// backend/src/controllers/delivery/deliveryController.js
const deliveryService = require('../../services/deliveryService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all deliveries (for admin/seller/delivery person dashboards)
 * @route   GET /api/v1/deliveries
 * @access  Private (Admin, Seller, Delivery Person - filtered by role)
 */
exports.getAllDeliveries = catchAsync(async (req, res, next) => {
    // Implement logic to filter deliveries based on user role (admin sees all, seller sees theirs, delivery person sees assigned)
    const query = { ...req.query };
    if (req.user.role === 'seller') {
        query.seller = req.user.id;
    } else if (req.user.role === 'delivery') {
        query.assignedTo = req.user.id;
    }

    const { deliveries, pagination } = await deliveryService.getDeliveries(query);

    res.status(200).json({
        success: true,
        count: deliveries.length,
        pagination,
        data: deliveries,
    });
});

/**
 * @desc    Get a single delivery by ID
 * @route   GET /api/v1/deliveries/:id
 * @access  Private (Admin, Seller, Delivery Person, User - if authorized)
 */
exports.getDeliveryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const delivery = await deliveryService.getDeliveryById(id);

    if (!delivery) {
        return next(new ApiError('Delivery not found.', 404));
    }

    // Authorization check: Ensure only authorized users can view details
    if (req.user.role === 'customer' && delivery.user.toString() !== req.user.id.toString()) {
        return next(new ApiError('Not authorized to view this delivery.', 403));
    }
    if (req.user.role === 'seller' && delivery.seller.toString() !== req.user.id.toString()) {
        return next(new ApiError('Not authorized to view this delivery.', 403));
    }
    if (req.user.role === 'delivery' && delivery.assignedTo && delivery.assignedTo.toString() !== req.user.id.toString()) {
        return next(new ApiError('Not authorized to view this delivery.', 403));
    }

    res.status(200).json({
        success: true,
        data: delivery,
    });
});

/**
 * @desc    Update a delivery's status
 * This is crucial for delivery persons to mark progress.
 * @route   PUT /api/v1/deliveries/:id/status
 * @access  Private (Delivery Person, Admin)
 */
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { newStatus, currentLocation, deliveredBy, deliverySignature } = req.body;
    const userId = req.user.id; // The user (delivery person/admin) performing the update

    if (!newStatus) {
        return next(new ApiError('New status is required.', 400));
    }

    // The service handles validation of status transitions and role authorization
    const updatedDelivery = await deliveryService.updateDeliveryStatus(
        id,
        newStatus,
        userId,
        currentLocation,
        deliveredBy, // Could be signature image URL or name
        deliverySignature // Could be signature image URL or boolean
    );

    res.status(200).json({
        success: true,
        message: 'Delivery status updated successfully.',
        data: updatedDelivery,
    });
});

/**
 * @desc    Assign a delivery to a delivery person
 * @route   PUT /api/v1/deliveries/:id/assign
 * @access  Private (Admin only)
 */
exports.assignDelivery = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Delivery ID
    const { deliveryPersonId } = req.body; // ID of the delivery person to assign

    // Authorization check: only admins can assign deliveries
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can assign deliveries.', 403));
    }

    if (!deliveryPersonId) {
        return next(new ApiError('Delivery person ID is required for assignment.', 400));
    }

    const updatedDelivery = await deliveryService.assignDeliveryToPerson(id, deliveryPersonId);

    res.status(200).json({
        success: true,
        message: 'Delivery assigned successfully.',
        data: updatedDelivery,
    });
});

// Note: Creating new deliveries is typically handled by the order processing flow in orderService.
// Deleting deliveries might be an admin-only function.