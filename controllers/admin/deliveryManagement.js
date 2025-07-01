// backend/src/controllers/admin/deliveryManagement.js
const deliveryService = require('../../services/deliveryService');
const userService = require('../../services/userService'); // Pour gérer les livreurs (utilisateurs avec rôle 'delivery')
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all delivery personnel (users with 'delivery' role)
 * @route   GET /api/v1/admin/delivery-personnel
 * @access  Private (Admin only)
 */
exports.getAllDeliveryPersonnel = catchAsync(async (req, res, next) => {
    const deliveryPersonnel = await userService.getUsersByRole('delivery', req.query);

    res.status(200).json({
        success: true,
        count: deliveryPersonnel.length,
        data: deliveryPersonnel,
    });
});

/**
 * @desc    Assign a delivery to a specific delivery person
 * @route   PUT /api/v1/admin/deliveries/:deliveryId/assign-person
 * @access  Private (Admin only)
 */
exports.assignDeliveryToPersonnel = catchAsync(async (req, res, next) => {
    const { deliveryId } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
        return next(new ApiError('Delivery person ID is required for assignment.', 400));
    }

    const updatedDelivery = await deliveryService.assignDeliveryToPerson(deliveryId, deliveryPersonId, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Delivery assigned to personnel successfully.',
        data: updatedDelivery,
    });
});

/**
 * @desc    Get all deliveries (admin view, with full details)
 * @route   GET /api/v1/admin/delivery-tracking
 * @access  Private (Admin only)
 *
 * Note: This might overlap with `deliveryController.js` `getAllDeliveries` but can
 * provide more detailed data specific to admin needs (e.g., internal notes).
 */
exports.getAllDeliveryTrackingAdmin = catchAsync(async (req, res, next) => {
    const { deliveries, pagination } = await deliveryService.getDeliveries(req.query);

    res.status(200).json({
        success: true,
        count: deliveries.length,
        pagination,
        data: deliveries, // Full details
    });
});

/**
 * @desc    (Optional) Update a delivery person's status/availability
 * @route   PUT /api/v1/admin/delivery-personnel/:id/status
 * @access  Private (Admin only)
 */
exports.updateDeliveryPersonnelStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'active', 'inactive', 'on-break'

    if (!status) {
        return next(new ApiError('Status is required.', 400));
    }

    const updatedPersonnel = await userService.updateUser(id, { deliveryStatus: status });

    res.status(200).json({
        success: true,
        message: 'Delivery personnel status updated successfully.',
        data: updatedPersonnel,
    });
});