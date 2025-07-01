// backend/src/controllers/delivery/deliverySlotController.js
const deliveryService = require('../../services/deliveryService'); // Assuming deliveryService manages slots
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get available delivery slots for a given date/area
 * @route   GET /api/v1/delivery-slots
 * @access  Public (customers can view available slots)
 */
exports.getAvailableDeliverySlots = catchAsync(async (req, res, next) => {
    const { date, areaCode, deliveryMethod } = req.query; // Area code could be postal code, city, etc.

    if (!date) {
        return next(new ApiError('Date is required to find available slots.', 400));
    }

    const slots = await deliveryService.getAvailableDeliverySlots(date, areaCode, deliveryMethod);

    res.status(200).json({
        success: true,
        count: slots.length,
        data: slots,
    });
});

/**
 * @desc    Create new delivery slots (for admin)
 * @route   POST /api/v1/admin/delivery-slots
 * @access  Private (Admin only)
 */
exports.createDeliverySlots = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can create delivery slots.', 403));
    }

    const { date, startTime, endTime, capacity, areaCode, deliveryMethod } = req.body;

    if (!date || !startTime || !endTime || !capacity || !areaCode || !deliveryMethod) {
        return next(new ApiError('Date, start time, end time, capacity, area code, and delivery method are all required.', 400));
    }

    const newSlot = await deliveryService.createDeliverySlot({
        date,
        startTime,
        endTime,
        capacity,
        areaCode,
        deliveryMethod,
    });

    res.status(201).json({
        success: true,
        message: 'Delivery slot created successfully.',
        data: newSlot,
    });
});

/**
 * @desc    Update a delivery slot (for admin)
 * @route   PUT /api/v1/admin/delivery-slots/:id
 * @access  Private (Admin only)
 */
exports.updateDeliverySlot = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can update delivery slots.', 403));
    }

    const updatedSlot = await deliveryService.updateDeliverySlot(id, updateData);

    res.status(200).json({
        success: true,
        message: 'Delivery slot updated successfully.',
        data: updatedSlot,
    });
});

/**
 * @desc    Delete a delivery slot (for admin)
 * @route   DELETE /api/v1/admin/delivery-slots/:id
 * @access  Private (Admin only)
 */
exports.deleteDeliverySlot = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can delete delivery slots.', 403));
    }

    await deliveryService.deleteDeliverySlot(id);

    res.status(200).json({
        success: true,
        message: 'Delivery slot deleted successfully.',
    });
});